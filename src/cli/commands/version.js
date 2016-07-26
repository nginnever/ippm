'use strict'

const Command = require('ronin').Command
const utils = require('../utils')

module.exports = Command.extend({
  desc: 'returns the registered package version',

  run: (name) => {
    utils.getIPPM((err, ippm) => {
      if (err) { throw err }
      if (!name) { throw new Error('must supply a package name')}
      ippm.version(name, (err, res) => {
        if (err) {
          throw err
        }
        console.log(name + ' version: ' + res)
      })
    })
  }
})
