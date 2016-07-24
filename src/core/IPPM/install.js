'use strict'

const jsonfile = require('jsonfile')
const path = require('path')
const Web3 = require('web3')
const IPFS = require('ipfs')
const abi = require('../utils').abi
const bs58 = require('bs58')

let web3
let ipfs
var index = {}

function searchReg (name) {
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

function writeDep (pkgName) {
  return new Promise((resolve, reject) => {
    searchReg(pkgName).then((ihash) => {
      // if (ihash[2] === '') { return reject(new Error ('package not found in registry')) }
      /* getLatestVersion(ihash[2]+ihash[3]).then((dephash) => {
        console.log()
      }) */
      getLatestVersion('QmbzSwZYjFTLNu2qN8rw4Htkte6wFdjFNTSLJeuWf4rGbV').then((dephash) => {
        console.log('hash: ' + ihash[2] + ihash[3])
        console.log('writing: ' + pkgName + ' - version: ' + index[pkgName])
        getWriteDep('Qmd2Zgzua4atXuqZRTMsMGekDxSftkgNwZxofT9tA6PW47').then(() => {
          resolve(pkgName)
        })
      })
    })
  })
}

function getWriteDep (dephash) {
  return new Promise((resolve, reject) => {
    ipfs.files.get(dephash, (err, res) => {
      if (err) { return reject(err) }
      res.on('data', (file) => {
      	if (file.content === null) {return reject()}
        file.content.on('data', (buf) => {
          console.log(buf)
        })
        file.content.on('end', () => {
      	  console.log('stream ended')
          resolve()
        })
      })
    })
  })
}

function readDeps (linkHash) {
  return new Promise((resolve, reject) => {
    ipfs.files.get(linkHash, (err, res) => {
      if (err) { return reject(err) }
      res.on('data', (file) => {
        file.content.on('data', (buf) => {
          const deps = JSON.parse(buf.toString()).dependencies
          const devDeps = JSON.parse(buf.toString()).devDependencies
          var combine = {}
          for (var key0 in deps) combine[key0] = deps[key0]
          for (var key1 in devDeps) combine[key1] = devDeps[key1]
          index = combine
          for (var key2 in combine) {
            // version
            // console.log(deps[key])
            writeDep(key2).then((k) => {
              console.log('wrote: ' + k)
            })
          }
        })
      })
    })
    resolve()
  })
}

function readPkgFile (pkgHash) {
  return new Promise((resolve, reject) => {
    var f = false
    const mh = new Buffer(bs58.decode(pkgHash))
    ipfs.object.get(mh, (err, res) => {
      if (err) { reject(err) }
      res.links.forEach((link) => {
        if (link.name === 'package.json') {
          f = true
          resolve(link.hash)
        }
      })
      // not sure this is a good idea
      if (!f) {
        ipfs.goOffline((err, res) => {
          if (err) { reject(err) }
        })
        // reject()
      }
    })
  })
}

function ipfsOn () {
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
}

function ipfsOff () {
  ipfs.goOffline((err, res) => {
    if (err) { throw (err) }
    //resolve()
  })
}

function getLatestVersion (hash) {
  return new Promise((resolve, reject) => {
    ipfs.files.get(hash, (err, res) => {
      if (err) { return reject(err) }
      res.on('data', (file) => {
        file.content.on('data', (buf) => {
          // always grab the latest registered version
          const size = JSON.parse(buf.toString()).versions.length
          resolve(JSON.parse(buf.toString()).versions[size - 1].hash)
        })
      })
    })
  })
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

      searchReg(name).then((res) => {
        if (res[2] === '') {
          console.log('No package found')
          return
        }
        console.log('element: ' + res[2] + res[3])
        ipfsOn().then(() => {
          console.log('ipfs online')
          getLatestVersion(res[2] + res[3]).then((pkgHash) => {
            readPkgFile(pkgHash).then((linkHash) => {
              console.log('repository: ' + bs58.encode(linkHash))
              readDeps(linkHash).then((someReturn) => {
                ipfsOff()
              })
            })
          })
        })
      })
      console.log('Installing: ' + name)
    }
  }
}
