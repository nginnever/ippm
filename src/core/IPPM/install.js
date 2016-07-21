'use strict'

const jsonfile = require('jsonfile')
const path = require('path')
const Web3 = require('web3')
const IPFS = require('ipfs')
const abi = require('../utils').abi

let web3
let ipfs

function search (name) {
  return new Promise((resolve, reject) => {
    const registryContract = web3.eth.contract(abi)
    // const regInstance = registryContract.at('0xb5f546d5bc8ab6ce0a4091c8bf906800627912cd')
    // server test net
    const regInstance = registryContract.at('0x7b7ac61b0c77fbde14b61eb31494abd05f4fd0ae')
    regInstance.registry(name, (err, res) => {
      if (err) { reject(err) }
      resolve(res)
    })
  })
}

function readPkgFile (pkgHash) {
  return new Promise((resolve, reject) => {
    ipfs.goOffline((err, res) => {
      if (err) { reject(err) }
      resolve()
    })
  })
}

function getPkg (hash) {
  return new Promise((resolve, reject) => {
    ipfs = new IPFS()
    ipfs.init({}, (err) => {
      if (err) {
        if (err.message === 'repo already exists') {
          return resolve()
        }
        return reject(err)
      }
      resolve()
    })
  })
    .then(() => new Promise((resolve, reject) => {
      console.log('repo ready!')
      ipfs.goOnline(() => resolve(ipfs))
    }))
    .then((id) => new Promise((resolve, reject) => {
      console.log('ipfs online')
      ipfs.config.show((err, config) => {
        if (err) return reject(err)
        resolve(config)
      })
    }))
    .then(() => new Promise((resolve, reject) => {
      ipfs.id((err, id) => {
        if (err) return reject(err)
        resolve(id)
      })
    }))
    .then((id) => new Promise((resolve, reject) => {
      ipfs.files.get(hash, (err, res) => {
        if (err) { return reject(err) }
        res.on('data', (file) => {
          file.content.on('data', (buf) => {
            // always grab the latest registered version
            const size = JSON.parse(buf.toString()).versions.length
            console.log(JSON.parse(buf.toString()).versions)
            resolve(JSON.parse(buf.toString()).versions[size - 1].hash)
          })
        })
      })
      // console.log(id)
    }))
}

module.exports = function install (self) {
  return (name, callback) => {
    if (typeof name === 'function') {
      callback = name
      name = ''
    }

    if (!name) {
      const file = path.join(process.cwd().toString(), 'package.json')
      jsonfile.readFile(file, (err, obj) => {
        if (err) {
          if (err.errno === -2) {
            return callback('No package.json found in this directory, please use ippm init', null)
          }
          return callback(err, null)
        }
        console.log(obj)
      })
    } else {
      if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider)
      } else {
        // set the provider you want from Web3.providers
        // local server
        // web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))

        // demo server
        web3 = new Web3(new Web3.providers.HttpProvider('http://149.56.133.176:8545'))
      }

      search(name).then((res) => {
        if (res[2] === '') {
          console.log('No package found')
          return
        }
        console.log('ipfs: ' + res[2] + res[3])
        getPkg(res[2] + res[3]).then((pkgHash) => new Promise((resolve, reject) => {
          readPkgFile(pkgHash)
        }))
      })
      console.log('Installing: ' + name)
    }
  }
}
