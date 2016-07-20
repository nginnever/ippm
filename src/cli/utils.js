'use strict'
const IPPM = require('../core')
const Web3 = require('web3')

let web3


exports = module.exports

exports.getIPPM = function (callback) {
  const ippm = new IPPM()
  callback(null, ippm)
}
