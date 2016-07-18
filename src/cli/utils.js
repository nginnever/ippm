'use strict'
const IPPM = require('../core')

exports = module.exports

exports.getIPPM = getIPPM

function getIPPM (callback) {
	const ippm = new IPPM()
	callback(null, ippm)
}