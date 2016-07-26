'use strict'

const test = require('./IPPM/test')
const init = require('./IPPM/init')
const install = require('./IPPM/install')
const publish = require('./IPPM/publish')
const version = require('./IPPM/version')

exports = module.exports = IPPM

function IPPM () {
  if (!(this instanceof IPPM)) {
    throw new Error('Must be instantiated with new')
  }

  this.test = test(this)
  this.init = init(this)
  this.install = install(this)
  this.publish = publish(this)
  this.version = version(this)
}
