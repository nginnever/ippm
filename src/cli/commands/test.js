'use strict'

const Command = require('ronin').Command

module.exports = Command.extend({
	desc: 'testing cli',

	options: {
		format: {
			alias: 'f',
			type: 'string'
		}
	},

	run: (name) => {
		console.log('weeee command ran')
	}
})