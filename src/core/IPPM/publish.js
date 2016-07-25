'use strict'

const isIPFS = require('is-ipfs')
const Web3 = require('web3')
const IPFS = require('ipfs')

let web3
let ipfs

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
}


module.exports = function publish (self) {
  return (name, callback) => {
  	if (name === undefined) { return callback(new Error('package name must be supplied'), null)}

    web3On()
    ipfsOn().then(() => {
    	console.log('IPFS online')
    })
  }
}
