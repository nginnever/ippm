'use strict'

const Command = require('ronin').Command
const utils = require('../utils')

module.exports = Command.extend({
  desc: 'initialize package.json',

  options: {
    force: {
      alias: 'f',
      type: 'boolean'
    }
  },

  run: (options) => {
    utils.getIPPM((err, ippm) => {
      ippm.init()
    })
  }
})
