'use strict'

module.exports = function init (self) {
  return(opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    console.log('init command core')
  }
}