---
title: FAQ
menuOrder: 30
autotoc: true
---

# Frequently Asked Question

## How To Retrieve An Image Through The Proxy?

You can retrieve an image using the `httpRequest.getRawProxy` method and then
creating the `Image` element using a Blob URL:

```javascrtipt
httpRequest.getRawProxy("http://example.org/hello.jpg")
    .then(function(imageBuffer) {
        var imageBlob = new Blob([imageBuffer], {type: "image/jpeg"});
        var imageBlobUrl = URL.createObjectURL(imageBlob);

        var img = new Image();

        img.onload = function() {
            console.log("Image loaded:", img);
        };

        img.onerror = function(error) {
            console.error("Unable to load the image:", error);
        };

        img.src = imageBlobUrl;
    })
```

## How To Use a Node Buffer in a Browser?

If you are using [Browserify][] you have nothing to do, it will automatically
add required libraries to your bundle.

If you are not using Browserify, you have to use the [buffer
library][bufferlib].


[Browserify]: http://browserify.org/
[bufferlib]: https://github.com/feross/buffer
