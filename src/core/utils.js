'use strict'

exports.abi =
  [{
    "constant": true,
    "inputs": [],
    "name": "tail",
    "outputs": [{
      "name": "",
      "type": "bytes32"
    }],
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "name",
      "type": "bytes32"
    }, {
      "name": "hash1",
      "type": "string"
    }, {
      "name": "hash2",
      "type": "string"
    }],
    "name": "publish",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "",
      "type": "bytes32"
    }],
    "name": "registry",
    "outputs": [{
      "name": "previous",
      "type": "bytes32"
    }, {
      "name": "next",
      "type": "bytes32"
    }, {
      "name": "hash1",
      "type": "string"
    }, {
      "name": "hash2",
      "type": "string"
    }],
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "head",
    "outputs": [{
      "name": "",
      "type": "bytes32"
    }],
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "size",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "name",
      "type": "bytes32"
    }, {
      "name": "hash1",
      "type": "string"
    }, {
      "name": "hash2",
      "type": "string"
    }],
    "name": "init",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "",
      "type": "bytes32"
    }],
    "name": "owners",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "type": "function"
  }]
