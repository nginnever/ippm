'use strict'

const Web3 = require('web3')

let web3

module.exports = function test (self) {
  return(name, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }
    console.log(name)

    if (typeof web3 !== 'undefined') {
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      // local server
      //web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.0.28:8545"))

      // demo server
      web3 = new Web3()
      web3.setProvider(new web3.providers.HttpProvider('http://149.56.133.176:8545'))
      //web3 = new Web3(new Web3.providers.HttpProvider("http://149.56.133.176:8545"))
      console.log(web3.isConnected())
    }

    web3.eth.getBlock(34, function(error, result){
    if(!error){
        console.log(result)
        console.log(web3.eth.accounts[0])
    }
    else {
        console.error(error);
    }
	})
    //console.log(web3.eth.accounts[0])
    console.log('Install core ' + name)
  }
}