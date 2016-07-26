'use strict'

const Web3 = require('web3')
const IPFS = require('ipfs')
const path = require('path')
const glob = require('glob')
const fs = require('fs')
const async = require('async')
const bs58 = require('bs58')
const abi = require('../utils').abi
const jsonfile = require('jsonfile')

const p = path.join(process.cwd(), 'package.json')
const pkgjson = require(p)

let web3
let ipfs
let rs
let elementHash
let registryContract
let regInstance
var repoInit
var fileHashs = {}
var ipld = {}
var rootDir

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
  })
}

function web3On () {
  if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider)
  } else {
    // set the provider you want from Web3.providers
    // local server
    // web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))

    // demo server
    web3 = new Web3(new Web3.providers.HttpProvider('http://149.56.133.176:8545'))
  }
  registryContract = web3.eth.contract(abi)
  // const regInstance = registryContract.at('0xb5f546d5bc8ab6ce0a4091c8bf906800627912cd')
  // server test net
  regInstance = registryContract.at('0x7b7ac61b0c77fbde14b61eb31494abd05f4fd0ae')
}

function packageFiles (pkgpath) {
  return new Promise((resolve, reject) => {
    rootDir = pkgpath.substring(pkgpath.lastIndexOf('/') + 1, path.length)
    const substr = 'node_modules'
    glob(path.join(pkgpath, '/**/*'), (err, res) => {
      if (err) { return reject(err) }
      ipfs.files.createAddStream((err, i) => {
        if (err) { reject(err) }
        i.on('data', (file) => {
          fileHashs[file.path] = bs58.encode(file.node.multihash()).toString()
          console.log('added', bs58.encode(file.node.multihash()).toString(), file.path)
        })
        i.once('end', () => {
          resolve()
        })
        async.eachLimit(res, 10, (element, callback) => {
          if (element.indexOf(substr) > -1) {
            callback()
            return
          }
          if (fs.statSync(element).isDirectory()) {
            callback()
            return
          }
          i.write({
            path: element.substring(element.indexOf(rootDir), element.length),
            content: fs.createReadStream(element)
          })
          callback()
        }, (err) => {
          if (err) { reject(err) }
          i.end()
        })
      })
    })
  })
}

function publishHash (repoHash) {
  return new Promise((resolve, reject) => {
    createIPLD(repoHash, pkgjson.name, pkgjson.version).then((ipldobj) => {
      console.log('IPLD object created')
      ipfs.files.createAddStream((err, i) => {
        if (err) { reject(err) }
        i.on('data', (file) => {
          elementHash = bs58.encode(file.node.multihash()).toString()
          console.log('added', bs58.encode(file.node.multihash()).toString(), file.path)
        })
        i.once('end', () => {
          fs.unlinkSync(fpath)
          const hash1 = elementHash.substring(0, 17)
          const hash2 = elementHash.substring(17, elementHash.length)
          if (!repoInit) {
            regInstance.init(pkgjson.name, hash1, hash2, {from: '0xf8ffa4023fc58b0321e6619b07962a75115803c6', gas: 150000}, (err, txhash) => {
              if (err) { reject(err) }
              resolve(txhash)
            })
          } else {
            regInstance.publish(pkgjson.name, hash1, hash2, {from: '0xf8ffa4023fc58b0321e6619b07962a75115803c6', gas: 150000}, (err, txhash) => {
              if (err) { reject(err) }
              resolve(txhash)
            })
          }
        })
        const fpath = path.join(process.cwd(), 'tmp.json')
        jsonfile.writeFileSync(fpath, ipldobj)
        rs = fs.createReadStream(path.join(process.cwd(), 'tmp.json'))
        const filePair = {path: 'null', content: rs}
        i.write(filePair)
        i.end()
      })
    })
  })
}

function createIPLD (rHash, rName, rVersion) {
  return new Promise((resolve, reject) => {
    searchReg(rName).then((res) => {
      // if this package is not already registered
      if (res[2] === '') {
        repoInit = false
        ipld['name'] = rName
        ipld['versions'] = []
        ipld['versions'].push({
          version: '^' + rVersion,
          hash: rHash
        })
        ipld['versions'][0]['hash'] = rHash
        resolve(ipld)
        return
      }
      repoInit = true
      getIPLD(res[2] + res[3]).then((obj) => {
        obj['versions'].push({
          version: '^' + rVersion,
          hash: rHash
        })
        resolve(obj)
      })
    })
  })
}

function getIPLD (hash) {
  return new Promise((resolve, reject) => {
    ipfs.files.get(hash, (err, res) => {
      if (err) { return reject(err) }
      res.on('data', (file) => {
        file.content.on('data', (buf) => {
          resolve(JSON.parse(buf.toString()))
        })
      })
    })
  })
}

function searchReg (name) {
  return new Promise((resolve, reject) => {
    regInstance.registry(name, (err, res) => {
      if (err) { reject(err) }
      resolve(res)
    })
  })
}

module.exports = function publish (self) {
  return (pkgpath, callback) => {
    web3On()
    ipfsOn().then(() => {
      console.log('IPFS online')
      console.log(pkgpath)
      packageFiles(pkgpath).then(() => {
        console.log('finished adding files!!!')
        publishHash(fileHashs[rootDir]).then((r) => {
          console.log('Published transaction hash: ' + r)
          console.log('finished publishing package!!!')
          ipfsOff()
        })
      })
    })
  }
}
