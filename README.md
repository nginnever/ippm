<img src="http://i.imgur.com/65GfDmT.png"></img>

# Interplanetary Package Manager

An NPM compatible distributed package manager tool for Javascript dependencies.

WIP: *this is not production ready... see TODO for progress towards removing WIP tag*

## Table of Contents

- [Background](#background)
  - [Motivation](#motivation)
- [Install](#install)
  - [Usage](#usage)
- [Commands](#commands)
  - [Init](#init)
  - [Install](#install)
  - [Publish](#publish)
  - [Version](#version)
- [Web Interface](#web-interface) 
- [Data Model](#data-model)
- [Contribute](#contribute)
- [TODO](#todo)
- [License](#license)

## Background

#### IPFS

ippm packages are distributed with [IPFS](https://ipfs.io) which content addresses files via a DHT. More information on the libp2p network stack and IPFS content addressing can be found [here](https://github.com/ipfs/specs). Currently ippm uses a set of servers with @diasdavid [npm-registry mirror](https://github.com/diasdavid/npm-on-ipfs) to help seed the packages until a more robust system of distributed payment (filecoin) is implemented.

For now this will require a running go-ipfs daemon to download packages. See the js-ipfs branch for full js implementation.

*TODO: Work on routing blocks in js-ipfs*

//This is built with js-ipfs and no prior installation will be required to have a node boot up and access the network. //Optionally I would like to build a switch to run js-ipfs-api to a local go-ipfs node.

#### Ethereum

[Ethereum](www.ethereum.org) (ETH) is the blockchain chosen for ippm. This maintains that permissions over packages are distributed as well as act as a pointer to published packages. ippm uses the [ippm-registry](https://github.com/nginnever/ippm-registry) to accomplish this.

## Motivation

Package managers like [npm](https://www.npmjs.com/) are great tools for developers. ippm is an attempt to improve a system like npm with distribution of data, registry, and control. The need for such improvements is as follows: 

#### Legal

Left pad is an example case of one developer put under legal pressures to remove a package thus inspiring him to remove another dependency of many popular javascript modules.  The removal of the package caused damage to many dependent systems which caused the central authority of npm to controversially reinstate the removed package without permission. With ippm upgrades to npm, the permission to packages is attached to the private key of the owner and not a large corporation.

[more information](http://www.theregister.co.uk/2016/03/23/npm_left_pad_chaos/)

#### Data Availability

Rather than stored in a data center, ippm hopes to achieve data redundancy with p2p protocols. This raises questions about how to incentivise nodes to seed packages that filecoin hopes to answer.

#### Distributed Registry

The modules are stored in IPFS and retrievable by their hash stored in a distributed blockchain, the hash can then be cryptographically tied to an identity. You automatically get signed and verified software packages as a default behavior.

#### Costs

```Free as in freedom, there are still going to be financial costs to running this. Currently there is a miner fee for publishing packages, public or private cost the same. There is also a need to support the nodes seeding packages on ipfs. The metrics for that have not been worked out yet.```

ippm private repositories can be created by encrypting the data before hashing with ipfs. In the future an encryption option will be provided in a private repository function. This feature is free for individual and production use cases.

## Install

#### Requirements

- Node v4.x (LTS) or higher
- npm (but not for long)
- go-ipfs daemon (but not for long)

#### Install via npm

*NPM published version of ippm requires a running go-ipfs daemon to work atm, see [usage](#usage) for more info.*

Option 1: Git clone

```
git clone https://github.com/nginnever/ippm.git
cd ippm
sudo npm i -g
```

Option 2: npm

```npm i interplanetary-package-manager```

install ippm globally to use ippm from any location or run from ```/src/cli/bin.js```

```npm i interplanetary-package-manager  -g```

Option 3: IPFS (coming soon!)

Run a local go or js-ipfs node and cli

```
ipfs get <distribution hash>
cd <distribution hash>
./install
```

## Usage

#### Master Branch

The master branch currently requires that you run a local go-ipfs daemon in order to download packages from peers. See js-ipfs branch for the full javascript implementation.

1) Install go-ipfs - See [ipfs install](https://ipfs.io/docs/install/)

2) Init a repository  ```ipfs init```

3) Start ipfs daemon ```ipfs daemon``` (may need cors origin)

4) Use ippm commands

*example*

```
cd YourNewPackage
ippm init
ippm install acorn-test
```

#### js-ipfs Branch

The libp2p and js-ipfs branchs are a complete js implementation that are close to being ready. See TODO for more information. 

## Commands

#### Init

```
ippm init

OPTIONS:

 -f, --force

DESCRIPTION

nppm init will create the package.json file in the same format as npm packages
so that installing with ippm will remain compatible.

```

#### Install

```
ippm install <name> <options>

ARGUMENTS:

 -name <string> 'the name of the package to be installed'

OPTIONS:

 -p, --repo 'the path to an ipfs repo'

DESCRIPTION

ippm install will create a js-ipfs node (optionally supply a repo location) and 
connect via web3 RPC to a geth client test net. Install checks a smart contract
for the latest ipfs hash of the module to be installed. All modules are currently
installed under 'node_modules'

```

#### Publish

```
ippm publish <name>

ARGUMENTS:

 -folder <string> 'location of a folder with a package.json file'

DESCRIPTION

ippm publish looks in the current directory (optionally provide a different directory)
for a package.json file. It will hash the directory and publish the version number
with the hash and package name in the smart contract registry
```

#### Version

```
ippm version <name>

ARGUMENTS:

 -name <string> 'name of the package version you are checking'

DESCRIPTION

ippm version looks at the ethereum block chain to find the associated ipld hash for the 
supplied package name. The latest version is then grabbed from the array of version history
contained in the ipld object.
```

<img src="http://i.imgur.com/rHfxGzf.png" align="middle"></img>

<img src="http://i.imgur.com/FNitk2w.png" align="middle"></img>

<img src="http://i.imgur.com/T5nRnmk.png" align="middle"></img>

## Web Interface

http://localhost:8080/ipfs/QmSGXf6KXUZFUspCArTnLeYWm8dRK8cYiahcD8rLcbeY6b

There is a web application to interface with the ippm-registry where you can search, view and publish packages. This currently needs to have the correct json model as detailed below multihashed and supplied to the web client while publishing. More information can be found in [ippm-registry](https://github.com/nginnever/ippm-registry)

You can download the web client via the ipfs hash or go to the ippm-registry repo and build it from source.

## Data Model

Each node in the blockchain list will store a registry for the IPPM packages in [IPLD](https://github.com/ipfs/specs/tree/master/ipld) format. Here a ```"link"``` is an IPLD link to the content of the module.

Example: ipfs-unixfs-engine module

```registered hash: QmbzSwZYjFTLNu2qN8rw4Htkte6wFdjFNTSLJeuWf4rGbV```
```
{
  "name": "ipfs-unixfs-engine",
  "versions": [
    {
      "version": "^0.10.0",
      "link": {"/": "Qmd2Zgzua4atXuqZRTMsMGekDxSftkgNwZxofT9tA6PW47"},
      "owner": "0x87357c51c98ab021708cc769965117efbfdec5f6"
    }
  ]
}
```

## Contribute

Feel free to drop by #ipfs and ping me (voxelot) in irc or file an issue here.

## TODO

- [ ] update install algorithm
- [ ] document install algorithm
- [ ] register all of the npm modules in ippm-registry
- [ ] port registry-mirror repo format into the app
- [ ] publish the registry to the main ethereum chain
- [ ] Write js-ipfs-api switch for go-ipfs support
- [ ] Build binaries and install scripts for distribution
- [ ] add all of the nice npm symlink things
- [ ] Make web client publishing/permissions/accounts easy to use
- [ ] js-ipfs to handle both merkledag protobufs and ipld cbor objects

## License

[MIT](LICENSE)

