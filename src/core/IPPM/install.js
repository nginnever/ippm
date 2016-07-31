'use strict'

const jsonfile = require('jsonfile')
const path = require('path')
const Web3 = require('web3')
const IPFS = require('ipfs-api')
const abi = require('../utils').abi
const bs58 = require('bs58')
const pathExists = require('path-exists')
const fs = require('fs')
const bl = require('bl')
const async = require('async')

let web3
let ipfs
var pathname = ''
var oldpath = ''
var index = {}
const installPath = process.cwd() + '/node_modules'

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

function ensureDir (dir, cb) {
  pathExists(dir)
    .then((exists) => {
      if (!exists) {
        fs.mkdir(dir, cb)
      } else {
        cb()
      }
    })
    .catch(cb)
}

function writeDep (pkgName) {
  return new Promise((resolve, reject) => {
    searchReg(pkgName).then((ihash) => {
      if (ihash[2] === '') {
        console.log('dependency not registered skipping: ' + pkgName)
        return reject(new Error('package not found in registry'))
      }
      getLatestVersion(ihash[2] + ihash[3]).then((dephash) => {
        console.log('---')
        console.log('writing: ' + pkgName + ' - version: ' + index[pkgName])
        console.log('nodehash: ' + ihash[2] + ihash[3])
        console.log('dephash: ' + dephash)
        console.log('---')
        getFiles(dephash, pkgName).then(() => {
          resolve(pkgName)
        })
      })
    })
  })
}

function recurse (newpath, node, cb) {
  if (newpath != oldpath) { 
    pathname = path.join(pathname, newpath)
    oldpath = newpath
  }

  ipfs.object.get(node.hash, (err, res) => {
    if (res.data.toString() === '\b\u0001') {
      // TODO handle empty dirs
      //if (res.links === []) { return }
      async.eachSeries(res.links, (element, callback) => {
        recurse(node.name, element, (err, res) => {
          console.log(res)
          callback()
        })
      }, (err) => {
        if (err) { cb(err, null) }
        console.log(pathname)
        pathname = pathname.substring(0, pathname.lastIndexOf('/'))
        console.log(pathname)
        oldpath = newpath
        cb(null, 'finished walking folder ' + node.name)
        return
      })
    } else {
      cb(null, 'this link was a file ' + path.join(pathname, node.name))
    }
  })
}

function getFiles (dephash, pkgName) {
  return new Promise((resolve, reject) => {
    const mh = new Buffer(bs58.decode(dephash))
    ipfs.object.get(mh, (err, res) => {
      if (err) { return reject(err) }
      async.eachSeries(res.links, (element, callback) => {
        recurse('/', element, (err, res) => {
          console.log(res)
          callback()
        })
      }, (err) => {
        console.log('finished')
      })
      //res.on('data', fileHandler(res, pkgName))
      //res.on('end', resolve())
    })
  })
}

function fileHandler (result, pkgName) {
  return function onFile (file) {
    if (file.path.lastIndexOf('/') === -1) {
      ensureDir(path.join(installPath, pkgName))
    } else {
      const i = file.path.indexOf('/')
      const filePath = file.path.substring(i + 1, file.path.lastIndexOf('/') + 1)
      const checkDir = path.join(installPath, pkgName, filePath)
      ensureDir(checkDir, (err) => {
        if (err) { throw err }
        const f = file.path.substring(file.path.lastIndexOf('/') + 1, file.path.length)
        file.content.pipe(fs.createWriteStream(path.join(checkDir, f)))
      })
    }
  }
}

function createDeps (linkHash) {
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
    console.log(pkgHash)
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
    ipfs = IPFS('/ip4/127.0.0.1/tcp/5001')
    ipfs.id()
    .then(function (id) {
      resolve(ipfs)
    })
    .catch(function(err) {
      reject(err)
    })
  })
}

function getLatestVersion (hash) {
  return new Promise((resolve, reject) => {
    ipfs.cat(hash)
    .then((stream) => {
      stream.pipe(bl((err, data) => {
        const size = JSON.parse(data.toString()).versions.length
        resolve(JSON.parse(data.toString()).versions[size - 1].hash)
      }))
    })
    .catch((err) => {
      reject(err)
    })
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
        // place logic here for ippm install <no arg>
        // this should look in package.json and begin
        // installing dependencies, add this object to the index
        console.log(obj)
        web3On()
      })
    } else {
      web3On()
      searchReg(name).then((res) => {
        if (res[2] === '') {
          return callback (new Error('No package found'), null)
        }
        console.log('Installing: ' + name)
        console.log('element: ' + res[2] + res[3])
        ipfsOn().then(() => {
          console.log('ipfs online')
          getLatestVersion(res[2] + res[3]).then((pkgHash) => {
            console.log(pkgHash)
            readPkgFile(pkgHash).then((linkHash) => {
              console.log('writing package: ')
              ensureDir(installPath, () => {
                console.log('wrote node_modules folder: ')
                getFiles(pkgHash, name).then(() => {
                  createDeps(linkHash).then(() => {
                    ipfsOff()
                    return callback(null, true)
                  })
                })
              })
            })
          })
        }).catch((err) => {
          return callback(err, null)
        })
      })
    }
  }
}
