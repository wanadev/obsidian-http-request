---
title: Proxyfied Requests
menuOrder: 20
autotoc: true
---

# Proxyfied Requests

Proxyfied Request are HTTP request that are send to a proxy server that will
forward them to the destination server. This can be useful when you want to
retrieve assets from random sites and avoiding CORS.

To make a request, just require the module and use the method that best fit
your need.

```javascript
const httpRequest = require("obsidian-http-request");
```


## Proxy Server

TODO


## Simple Requests (HTTP GET)

When you just want to fetch assets, you can use simplified `get*Proxy` methods,
depending of what kind of data you retrieve.

All the following methods can take an additional argument to configure some
behavior of the proxy:

```javascript
httpRequest.get*Proxy(url, {
    headers: {},      // Additional custom HTTP headers
    allowedMimes: []  // Avoid the proxy to download data types that
                      //   are not listed here
}).then(...);
```

### httpRequest.getTextProxy

This method can be used to retrieve text. It returns a `String`.

```javascript
httpRequest.getTextProxy("http://www.example.com/hello.txt")
    .then(function(result) {
        console.log(result);  // -> String
    })
    .catch(function(error) {
        console.error(error);
    });
```

### httpRequest.getJsonProxy

This method can be used to retrieve JSON. It returns native Javascript objects
from the JSON.

```javascript
httpRequest.getJsonProxy("http://www.example.com/hello.json")
    .then(function(result) {
        console.log(result);  // -> {}
    })
    .catch(function(error) {
        console.error(error);
    });
```

### httpRequest.getRawProxy

This method can be used to retrieve raw (possibly binary) data. It returns
a [Node.js `Buffer`][buffer].

```javascript
httpRequest.getRawProxy("http://www.example.com/hello.zip")
    .then(function(result) {
        console.log(result);  // -> Node.js Buffer
    })
    .catch(function(error) {
        console.error(error);
    });
```


## Advanced Requests

TODO




[buffer]: https://nodejs.org/api/buffer.html
