# Obsidian HTTP Request

[![Build Status](https://travis-ci.org/wanadev/obsidian-http-request.svg?branch=master)](https://travis-ci.org/wanadev/obsidian-http-request)
[![NPM Version](http://img.shields.io/npm/v/obsidian-http-request.svg?style=flat)](https://www.npmjs.com/package/obsidian-http-request)
[![License](http://img.shields.io/npm/l/obsidian-http-request.svg?style=flat)](https://github.com/wanadev/obsidian-http-request/blob/master/LICENSE)
[![Dependencies](https://img.shields.io/david/wanadev/obsidian-http-request.svg?maxAge=2592000)]()
[![Dev Dependencies](https://img.shields.io/david/dev/wanadev/obsidian-http-request.svg?maxAge=2592000)]()


## Quick Start: Server-side

```javascript
"use strict";

var express = require("express");
var bodyParser = require("body-parser");
var proxyMiddleware = require("obsidian-http-request/server/http-proxy");

var PORT = process.env.PORT || 3042;

var app = express();

app.use("/proxy", bodyParser.raw({type: "application/json"}));
app.use("/proxy", proxyMiddleware({
    maxContentLength: 5 * 1024 * 1024,  // Allows to transfer files of 5 MiB max
    allowedPorts: [80, 443]             // Allows to download from ports 80 (http) and 443 (https)
}));

console.log("Starting Obsidian HTTP Request Proxy Test Server on 0.0.0.0:" + PORT);
app.listen(PORT);
```


## Quick Start: Client-side

### Without proxy

```javascript
"use strict";

var httpRequest = require("obsidian-http-request");

httpRequest.getRaw("http://www.example.com/hello.zip")
    .then(function(result) {
        console.log(result);  // -> Node.js Buffer
    });

httpRequest.getText("http://www.example.com/hello.txt")
    .then(function(result) {
        console.log(result);  // -> String
    });

httpRequest.getJson("http://www.example.com/hello.json")
    .then(function(result) {
        console.log(result);  // -> {}
    });
```

### With proxy

```javascript
"use strict";

var httpRequest = require("obsidian-http-request");

httpRequest.proxyPath = "/proxy";

httpRequest.getRawProxy("http://www.example.com/hello.zip", {headers: {}, allowedMimes: []})
    .then(function(result) {
        console.log(result);  // -> Node.js Buffer
    });

httpRequest.getTextProxy("http://www.example.com/hello.txt", {headers: {}, allowedMimes: []})
    .then(function(result) {
        console.log(result);  // -> String
    });

httpRequest.getJsonProxy("http://www.example.com/hello.json", {headers: {}, allowedMimes: []})
    .then(function(result) {
        console.log(result);  // -> {}
    });
```

__NOTE:__ `headers` and `allowedMimes` are optional.


## Changelog

* **1.1.4:** Updates dependencies
