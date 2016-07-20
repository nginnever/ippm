'use strict'

const Command = require('ronin').Command
const utils = require('../utils')

module.exports = Command.extend({
  desc: 'install a package',

  run: (name) => {
    utils.getIPPM((err, ippm) => {
      ippm.install(name)
    })
  }
})
