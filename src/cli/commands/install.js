'use strict'

const Command = require('ronin').Command
const utils = require('../utils')

module.exports = Command.extend({
  desc: 'install a package',

  options: {
    repo: {
      alias: 'p',
      type: 'string'
    }
  },

  run: (options, name) => {
    utils.getIPPM((err, ippm) => {
      if (err) { throw err }
      console.log('NAME: ' + name)
      console.log('REPO PATH: ' + options)
      ippm.install(name, (err, res) => {
        if (err) {
          throw err
        }
      })
    })
  }
})
