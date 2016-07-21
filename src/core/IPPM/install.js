'use strict'

const jsonfile = require('jsonfile')
const path = require('path')
const Web3 = require('web3')
const IPFS = require('ipfs')
const abi = require('../abi').abi

let web3

function search (name) {
  return new Promise((resolve, reject) => {
    const registryContract = web3.eth.contract(abi)
    // const regInstance = registryContract.at('0xb5f546d5bc8ab6ce0a4091c8bf906800627912cd')
    // server test net
    const regInstance = registryContract.at('0x7b7ac61b0c77fbde14b61eb31494abd05f4fd0ae')
    regInstance.registry(name, (err, res) => {
    	resolve(res)
    })
  })
}

function getPkgInfo (hash) {
	return new Promise((resolve, reject) => {
		const ipfs = new IPFS()
		console.log(hash)
	})
}

module.exports = function install (self) {
  return(name, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
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
	      web3 = new Web3(web3.currentProvider);
	    } else {
	      // set the provider you want from Web3.providers
	      // local server
	      //web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))

	      // demo server
	      web3 = new Web3(new Web3.providers.HttpProvider("http://149.56.133.176:8545"))
	    }

	    search(name).then((res) => {
	    	console.log('ipfs: ' + res[2] + res[3])
	    	getPkgInfo(res[2] + res[3])
	    })
	    console.log('Installing: ' + name)
    }
  }
}