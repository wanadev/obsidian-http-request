# Obsidian HTTP Request

[![Build Status](https://travis-ci.org/wanadev/obsidian-http-request.svg?branch=master)](https://travis-ci.org/wanadev/obsidian-http-request)
[![NPM Version](http://img.shields.io/npm/v/obsidian-http-request.svg?style=flat)](https://www.npmjs.com/package/obsidian-http-request)
[![License](http://img.shields.io/npm/l/obsidian-http-request.svg?style=flat)](https://github.com/wanadev/obsidian-http-request/blob/master/LICENSE)
[![Dependencies](https://img.shields.io/david/wanadev/obsidian-http-request.svg?maxAge=2592000)]()
[![Dev Dependencies](https://img.shields.io/david/dev/wanadev/obsidian-http-request.svg?maxAge=2592000)]()
[![Greenkeeper badge](https://badges.greenkeeper.io/wanadev/obsidian-http-request.svg)](https://greenkeeper.io/)


**Obsidian HTTP Request** is an helper library that allows you to download
assets and make HTTP requests either directly or through a proxy (to avoid CORS
issues, for example when using images from an other domain with a canvas).

![Obsidian HTTP Request Schemas](./doc/images/obsidian-http-request-schema.png)


## Documentation

You can find the library documentation at the following address:

* http://wanadev.github.io/obsidian-http-request/


## Example

```javascript
const httpRequest = require("obsidian-http-request");

httpRequest.getText("http://example.com/hello.txt")
    .then(function(result) {
        console.log(result);
    })
    .catch(function(error) {
        console.error(error);
    });
```


## Changelog

* **1.1.4:** Updates dependencies
