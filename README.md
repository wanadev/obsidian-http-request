# Obsidian HTTP Request

[![Tests](https://github.com/wanadev/obsidian-http-request/actions/workflows/tests.yml/badge.svg)](https://github.com/wanadev/obsidian-http-request/actions/workflows/tests.yml)
[![NPM Version](http://img.shields.io/npm/v/obsidian-http-request.svg?style=flat)](https://www.npmjs.com/package/obsidian-http-request)
[![License](http://img.shields.io/npm/l/obsidian-http-request.svg?style=flat)](https://github.com/wanadev/obsidian-http-request/blob/master/LICENSE)
[![Discord](https://img.shields.io/badge/chat-Discord-8c9eff?logo=discord&logoColor=ffffff)](https://discord.gg/BmUkEdMuFp)


**Obsidian HTTP Request** is a helper library that allows you to download
assets and make HTTP requests either directly or through a proxy (to avoid CORS
issues, for example when using images from an other domain with a canvas).

![Obsidian HTTP Request Schemas](./doc/images/obsidian-http-request-schema.png)


## Install

To install Obsidian HTTP Request run the following command:

    npm install obsidian-http-request


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


## Contributing

### Questions

If you have any question, you can:

* [Open an issue on GitHub][gh-issue]
* [Ask on discord][discord]

### Bugs

If you found a bug, please [open an issue on Github][gh-issue] with as much information as possible.

### Pull Requests

Please consider [filing a bug][gh-issue] before starting to work on a new feature. This will allow us to discuss the best way to do it. This is of course not necessary if you just want to fix some typo or small errors in the code.

### Coding Style / Lint

To check coding style, run the follwoing command:

    npx grunt jshint

### Tests

Tu run tests, use the following command:

    npx grunt test


[gh-issue]: https://github.com/wanadev/obsidian-http-request/issues
[discord]: https://discord.gg/BmUkEdMuFp


## Changelog

* **[NEXT]** (changes on master that have not been released yet):

  * Nothing yet ;)

* **v1.6.0:**

  * feat: Replaced the deprecated Q library by native Promises (@jbghoul, #66, #65)
  * misc(ci): Fixed test run on GitHub Actions (@jbghoul, #66)

* **v1.5.2:**

  * Replaced deprecated mocha-phantomjs by mocha-headless-chrome to run tests (@jbghoul, 27)
  * Fix: added missing lodash dependency (@jbghoul, #28)

* **v1.5.1:**

  * Updated dependencies (@jbghoul, #26)

* **v1.5.0:**

  * Add a method to get the result as Blob (#20)

* **v1.4.0:**

  * Adds status code and message in Error objects (#19)

* **v1.3.2:**

  * Accepts 2xx HTTP status code and not only 200 (client side)

* **v1.3.1:**

  * Proxy do not returns an error anymore when server respond with 2xx stvatus code (#14)

* **v1.3.0:**

  * Log URLs in error messages

* **v1.2.0:**

  * Generic `request` and `requestProxy` method (to be able to use different methods than GET, with more options) #6
  * Proxyfied methods can now be used with relative links
  * Better documentation

* **v1.1.4:**

  * Updates dependencies
