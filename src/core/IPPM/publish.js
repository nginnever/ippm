'use strict'

const isIPFS = require('is-ipfs')
const Web3 = require('web3')
const IPFS = require('ipfs')
const path = require('path')
const glob = require('glob')
const fs = require('fs')
const async = require('async')
const bs58 = require('bs58')

let web3
let ipfs
var fileHashs = {}
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
}

function packageFiles (pkgpath) {
  return new Promise((resolve, reject) => {
  	rootDir = pkgpath.substring(pkgpath.lastIndexOf('/') + 1, path.length)
  	const rootIndex = pkgpath.length
  	const substr = 'node_modules'
  	glob(path.join(pkgpath, '/**/*'), (err, res) => {
  		if (err) { return reject(err) }
  	  ipfs.files.createAddStream((err, i) => {
  	  	if (err) { reject(err) }
  	  	var filePair
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
		console.log(repoHash)
		resolve()
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
    		publishHash(fileHashs[rootDir]).then(() => {
    			console.log('finished publishing package!!!')
    			ipfsOff()
    		})
    	})
    })
  }
}
