'use strict'

const init = require('./IPPM/init')
const install = require('./IPPM/install')
const publish = require('./IPPM/publish')
const version = require('./IPPM/version')

exports = module.exports = IPPM

function IPPM () {
  if (!(this instanceof IPPM)) {
    throw new Error('Must be instantiated with new')
  }

  this.init = init(this)
  this.install = install(this)
  this.publish = publish(this)
  this.version = version(this)
}
