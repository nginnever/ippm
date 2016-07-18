'use strict'

module.exports = function test (self) {
  return(opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    console.log('weee everything set up!')
  }
}