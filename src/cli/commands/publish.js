'use strict'

const Command = require('ronin').Command
const utils = require('../utils')

module.exports = Command.extend({
  desc: 'publish a package',

  options: {
    repo: {
      alias: 'p',
      type: 'string'
    }
  },
  run: (folder) => {
    utils.getIPPM((err, ippm) => {
      if (err) { throw err }
      if (!folder) { folder = process.cwd() }
      console.log('PUBLISHING: ' + folder)
      ippm.publish(folder, (err, res) => {
        if (err) {
          throw err
        }
      })
    })
  }
})
