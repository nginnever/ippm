'use strict'

const Command = require('ronin').Command
const utils = require('../utils')

module.exports = Command.extend({
  desc: 'testing cli',

  options: {
    format: {
      alias: 'f',
      type: 'string'
    }
  },
  run: (name) => {
    console.log(name)
    utils.getIPPM((err, ippm) => {
      ippm.test()
    })
  }
})
