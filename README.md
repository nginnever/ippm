# Interplanetary Package Manager

An NPM compatible distributed package manager tool for Javascript dependencies.

## Table of Contents

- [Motivations](#motivations)
- [Install](#install)
- [Commands](#commands)
  - [Init](#init)
  - [Install](#install)
  - [Publish](#publish)
  - [Version](#version)
- [Data Model](#data-model)
- [Contribute](#contribute)
- [License](#license)

## Motivations

Package managers like [npm](https://www.npmjs.com/) are great tools for developers. ippm is an attempt to improve a system like npm with distribution of data, registry, and control. The need for such improvements is as follows: 

#### Legal

There has been a recent example case of one developer put under legal pressures to remove a dependecy thus inspiring him to remove another dependency of many popular javascript modules.  The removal of the package caused damage to many dependent systems which caused the central authority of npm to controversally reinstate the removed package without permission. With ippm upgrades to npm, the permission to packages in is the public key of the owner and not a large corporation.

[more information](http://www.theregister.co.uk/2016/03/23/npm_left_pad_chaos/)

#### Data Availability

ippm packages are distributed with [IPFS](https://ipfs.io) rather than stored in a data center. Currently ippm uses a set of servers with @daviddias [npm-registry mirror](https://github.com/diasdavid/npm-on-ipfs) to help seed the packages until a more robust system of distributed payment (filecoin) is implemented.

#### Distributed Registry

ippm uses the ethereum blockchain to maintain that permissions over packages are distributed. ippm uses the [ippm-registry](https://github.com/nginnever/ippm-registry) to accomplish this

#### Costs

```Free as in freedom, there are still going to be financial costs needed to run this. Currently there is a miner fee for publishing packages, public or private cost the same. There is also a need to support the nodes hosting your files on ipfs. The metrics for that have not been worked out yet.```

ippm private repositories can be created by encrypting the data before hashing with ipfs. In the future an ecryption option will be provided in a private repository function. This feature is free for individual and production use cases. 

## Install

#### Requirments

- node js
- npm (but not for long)

#### Install via npm

```npm i ippm```

ipfs hash: Qm...

install ippm globaly to use ippm from any location or run from ```/src/cli/bin.js```

```npm i ippm -g```

TODO: Build symlink capability in ippm

#### Install with IPFS

Run a local go or js-ipfs node and cli
```
ipfs get hash
cd hash
ippm install
```

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

ippm publish looks in the current directory (optionally provide a different directort)
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

## License

[MIT](LICENSE)

