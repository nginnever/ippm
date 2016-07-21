# Interplanetary Package Manager

An NPM compatible distributed package manager for Javascript dependencies.

## Data Model

Each node in the blockchain list will store a registry for the IPPM packages in [IPLD](https://github.com/ipfs/specs/tree/master/ipld) format. Here a link is an IPLD link to the content of the module.

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
