---
title: Proxyfied Requests
menuOrder: 20
autotoc: true
---

# Proxyfied Requests

Proxyfied Request are HTTP requests that are sent to a proxy server that will
forward them to the destination server. This can be useful when you want to
retrieve assets from random sites and avoid CORS.


## Proxy Server

To use proxyfied requests, your server must run a proxy that must be accessible
on the **same origin** (same domain, port and protocol) as the application
page.

Obsidian Proxy Server is not a standalone application but a middleware that can
be used with [Express][express].

### Implementing The Proxy Server

To implement this server in your application, you first have to install the
required dependencies:

```sh
npm install --save obsidian-http-request express body-parser
```

Then you can use the proxy middleware in your Express application:

```javascript
"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const proxyMiddleware = require("obsidian-http-request/server/http-proxy");

const PORT = process.env.PORT || 3042;

const app = express();

app.use("/proxy", bodyParser.raw({type: "application/json"}));
app.use("/proxy", proxyMiddleware({
    maxContentLength: 5 * 1024 * 1024,  // Allows to transfer files of 5 MiB max
    allowedPorts: [80, 443],            // Allows to download from ports 80 (http) and 443 (https)
    allowedMethods: ["GET"]             // Allows to forward only GET requests
}));

console.log(`Starting Obsidian Proxy Server on 0.0.0.0:${PORT}`);
app.listen(PORT);
```

__NOTE:__ By default the client library assumes that the proxy URL is `/proxy`.
If you change this route, you will have to configure it on the client side.

Finally, to run the server you can simply run the previous script using Node:

```sh
node server.js
```

__NOTE:__ for a production environment you will probably want to use a [process
manager][pm] to run the server-side application.

### Proxy Status Code

When the proxy operates, it can return various HTTP status code depending on
the request and encountered errors:

| Status | Meaning |
|--------|---------|
| 200    | Ok      |
| 400    | Bad Request: this code is used in several cases: <ul><li>when you make a request with a wrong protocol (other than `http` and `https`),</li><li>when you try to make a request on a port that is not in the server's `allowedPorts` list,</li><li>when the request made to the proxy is invalid or incomplete (in this case, it is probably a version mismatch between the client-side and server-side library).</li></ul> |
| 404    | Not Found: the proxy cannot access the resource on the remote server. This can be caused by several things: <ul><li>the URL is wrong or it cannot be accessed from the proxy server,</li><li>the remote server encountered an error (5XX),</li><li>the remote server requires to be authenticated to access the resource,</li><li>...</li></ul> Please note that the proxy server cannot follow redirection (3XX), so this will also end with a 404 status code. |
| 405    | Method Not Allowed: you tried to make a request using a method that is not in the server's `allowedMethods` list. |
| 406    | The mimetype of the requested resource is not in the `allowedMimes` list that was sent with the request (`httpRequest.get*Proxy(url, {allowedMimes: [...]})`). |
| 413    | Too Large: the requested resource is larger than the server's `maxContentLength` configuration. |
| 500    | An error occurred in the proxy server. |


## Client-Side Configuration

By default the client library assumes that the proxy URL is `/proxy`. If you
change this route in your server-side implementation, you will have to
configure it on the client side:

```javascript
const httpRequest = require("obsidian-http-request");
httpRequest.proxyPath = "/custom/proxy-route";
```


## Simple Requests (HTTP GET)

When you just want to fetch assets, you can use simplified `get*Proxy` methods,
depending on what kind of data you retrieve.

To make a request, just require the module and use the method that best fit
your need.

```javascript
const httpRequest = require("obsidian-http-request");
```

All the following methods can take an additional argument to configure some
behavior of the proxy:

```javascript
httpRequest.get*Proxy(url, {
    headers: {},      // Additional custom HTTP headers
    allowedMimes: []  // Prevent the proxy to download data types that
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

### httpRequest.getBlobProxy

This method can be used to retrieve data as a Blob. It returns
a native Javascript `Blob`.

```javascript
httpRequest.getBlobProxy("http://www.example.com/hello.png")
    .then(function(result) {
        console.log(result);  // -> Blob
    })
    .catch(function(error) {
        console.error(error);
    });
```

## Advanced Requests

Obsidian HTTP Request provides a method to allow you to send more advanced
requests (if you have to use a different method than `GET`, custom headers,
body,...).

Here is an example of how to send and receive JSON data:


```javascript
httpRequest.requestProxy("http://www.example.com/do-something", {
    method: "POST",
    headers: {
        "content-type": "application/json",
        "x-foo": "bar"
    },
    body: Buffer.from(JSON.stringify({foo: "bar"})),  // body must be a Node Buffer or null
    allowedMimes: ["application/json"]                // Only allows JSON response
})
    .then(function(resultBuffer) {                    // response is also a Node Buffer
        var result = JSON.parse(resultBuffer.toString());
        console.log(result);
    })
    .catch(function(error) {
        console.error(error);
    });
```

## Catching errors

Thown errors provide access to status code and message

```javascript
httpRequest.getTextProxy("http://www.example.com/404.txt")
    .catch(function(error) {
        console.error(error.statusCode); // 404
        console.error(error.statusMessage); // "Not Found"
    });
```
Cause error can be accessed for errors while parsing json response

```javascript
httpRequest.getJsonProxy("http://www.example.com/invalid.json")
    .catch(function(error) {
        console.error(error); // Error "NotAValidJson"
        console.error(error.cause); // Error "SyntaxError"
    });
```

[buffer]: https://nodejs.org/api/buffer.html
[express]: http://expressjs.com/
[pm]: http://expressjs.com/en/advanced/pm.html
