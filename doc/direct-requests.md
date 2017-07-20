---
title: Direct Requests
menuOrder: 10
autotoc: true
---

# Direct Requests

Direct Request are simply AJAX request that are not proxyfied.

To make a request, just require the module and use the method that best fit
your need.

```javascript
const httpRequest = require("obsidian-http-request");
```


## Simple Requests (HTTP GET)

When you just want to fetch assets, you can use simplified `get*` methods,
depending of what kind of data you retrieve.

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


## Advanced Requests

Obsidian HTTP Request provides a method to allow you to send more advanced
requests (if you have to use an other method than `GET`, custom headers,
body,...).

Here is an example to send and receive JSON data:

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



[buffer]: https://nodejs.org/api/buffer.html
