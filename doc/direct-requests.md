---
title: Direct Requests
menuOrder: 10
autotoc: true
---

# Direct Requests

Direct Request are simply AJAX request that are not proxyfied.

To make a request, just require the module and use the method that best fits
your need.

```javascript
const httpRequest = require("obsidian-http-request");
```


## Simple Requests (HTTP GET)

When you just want to fetch assets, you can use simplified `get*` methods,
depending on what kind of data you retrieve.

### httpRequest.getText

This method can be used to retrieve text. It returns a `String`.

```javascript
httpRequest.getText("http://www.example.com/hello.txt")
    .then(function(result) {
        console.log(result);  // -> String
    })
    .catch(function(error) {
        console.error(error);
    });
```

### httpRequest.getJson

This method can be used to retrieve JSON. It returns native Javascript objects
from the JSON.

```javascript
httpRequest.getJson("http://www.example.com/hello.json")
    .then(function(result) {
        console.log(result);  // -> {}
    })
    .catch(function(error) {
        console.error(error);
    });
```

### httpRequest.getRaw

This method can be used to retrieve raw (possibly binary) data. It returns
a [Node.js `Buffer`][buffer].

```javascript
httpRequest.getRaw("http://www.example.com/hello.zip")
    .then(function(result) {
        console.log(result);  // -> Node.js Buffer
    })
    .catch(function(error) {
        console.error(error);
    });
```

### httpRequest.getBlob

This method can be used to retrieve data as a Blob. It returns
a native Javascript `Blob`.
```javascript
httpRequest.getBlob("http://www.example.com/hello.png")
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
httpRequest.request("http://www.example.com/do-something", {
    method: "POST",
    headers: {
        "content-type": "application/json",
        "x-foo": "bar"
    },
    body: Buffer.from(JSON.stringify({foo: "bar"}))  // body must be a Node Buffer or null
})
    .then(function(resultBuffer) {                   // response is also a Node Buffer
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
httpRequest.getText("http://www.example.com/404.txt")
    .catch(function(error) {
        console.error(error.statusCode); // 404
        console.error(error.statusMessage); // "Not Found"
    });
```
Cause error can be accessed for errors while parsing json response

```javascript
httpRequest.getJson("http://www.example.com/invalid.json")
    .catch(function(error) {
        console.error(error); // Error "NotAValidJson"
        console.error(error.cause); // Error "SyntaxError"
    });
```

[buffer]: https://nodejs.org/api/buffer.html
