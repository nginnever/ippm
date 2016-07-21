'use strict'
const IPPM = require('../core')

exports = module.exports

exports.getIPPM = function (callback) {
  const ippm = new IPPM()
  callback(null, ippm)
}
