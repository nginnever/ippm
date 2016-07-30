'use strict'

const Web3 = require('web3')
const abi = require('../utils').abi
const IPFS = require('ipfs-api')
const bl = require('bl')

let web3
let ipfs
let regInstance
let registryContract

function searchReg (name) {
  return new Promise((resolve, reject) => {
    regInstance.registry(name, (err, res) => {
      if (err) { reject(err) }
      resolve(res)
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


function getLatestVersion (hash) {
  return new Promise((resolve, reject) => {
    ipfs.cat(hash)
    .then((stream) => {
      stream.pipe(bl((err, data) => {
      	const size = JSON.parse(data.toString()).versions.length
        resolve(JSON.parse(data.toString()).versions[size - 1].version)
      }))
    })
    .catch((err) => {
      reject(err)
    })
  })
}

module.exports = function version (self) {
  return (name, callback) => {
    web3On()
    searchReg(name).then((res) => {
      ipfsOn().then(() => {
        getLatestVersion(res[2] + res[3]).then((version) => {
          callback(null, version)
        })
      }).catch((err) => {
      	callback(err, null)
      })
    })
  }
}
