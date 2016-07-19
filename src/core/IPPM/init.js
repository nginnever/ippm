'use strict'

const jsonfile = require('jsonfile')
const prompt = require('prompt')
const colors = require("colors/safe")

module.exports = function init (self) {
  return(opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }
    console.log('Init will walk you through creating a package.json file now!')
    
    const properties = [
    	{
    		name: 'name'
    	},
    	{
    		name: 'version'
    	},
    	{
    		name: 'description'
    	},
    	{
    		name: 'entry'
    	},
    	{
    		name: 'test'
    	},
    	{
    		name: 'github'
    	},
    	{
    		name: 'keywords'
    	},
    	{
    		name: 'author'
    	},
    	{
    		name: 'license'
    	}
    ]

    const file = process.cwd() + '/package.json'
    var pkg = {}

    prompt.message = ''
    prompt.start()
    prompt.get(properties, (err, res) => {
    	if (err) { return onErr(err) }
      
    	pkg["name"] = res.name
    	pkg["version"] = res.version
    	pkg["description"] = res.description
    	pkg["main"] = res.entry
    	pkg["scripts"] = {}
    	pkg.scripts["test"] = res.test
    	pkg["author"] = res.author
    	pkg["license"] = res.license

    	jsonfile.writeFile(file, pkg, {spaces: 2}, (err) => {
    		if (err) {
    			console.log(err)
    		}
    		console.log('Wrote package.json at: ', process.cwd())
        })
    })

  	function onErr(err) {
  	  console.log(err)
  	  return 1
  	}
  }
}