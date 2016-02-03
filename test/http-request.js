"use strict";

var expect = require("expect.js");
var httpRequest = require("../lib/");

var ROOT_URL = window.location.protocol + "//" + window.location.host;
var SAMPLES_URL = ROOT_URL + "/samples/";

describe("http-request", function() {

    describe("getRaw", function() {

        it("can retrieve an ASCII text file", function() {
            return httpRequest.getRaw(SAMPLES_URL + "text-ascii.txt")
                .then(function(result) {
                    expect(result).to.be.a(Buffer);
                    expect(result).to.have.length(91);
                });
        });

        it("can retrieve a binary file", function() {
            return httpRequest.getRaw(SAMPLES_URL + "binary.bin")
                .then(function(result) {
                    expect(result).to.be.a(Buffer);
                    expect(result).to.have.length(6);
                    expect(result[0]).to.equal(0x00);
                    expect(result[1]).to.equal(0xBA);
                    expect(result[2]).to.equal(0xDD);
                    expect(result[3]).to.equal(0xCA);
                    expect(result[4]).to.equal(0xFE);
                    expect(result[5]).to.equal(0xFF);
                });
        });

        it("can retrieve large files", function() {
            return httpRequest.getRaw(SAMPLES_URL + "large-file.png")
                .then(function(result) {
                    expect(result).to.be.a(Buffer);
                    expect(result).to.have.length(633203);
                });
        });

        it("can report HTTP errors", function() {
            return httpRequest.getRaw(SAMPLES_URL + "404")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error).to.match(/HttpStatus404/);
                });
        });

        // Skipped because it makes tests timeout...
        it.skip("can report non-HTTP errors", function() {
            return httpRequest.getRaw("http://test.nowhere/")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error).to.match(/HttpConnexionError/);
                });
        });

    });

    describe("getText", function() {

        it("can retrieve an ASCII text file", function() {
            return httpRequest.getText(SAMPLES_URL + "text-ascii.txt")
                .then(function(result) {
                    expect(result).to.be.a("string");
                    expect(result).to.have.length(91);
                });
        });

        it("can retrieve an UTF-8 text file", function() {
            return httpRequest.getText(SAMPLES_URL + "text-utf8.txt")
                .then(function(result) {
                    expect(result).to.be.a("string");
                    expect(result).to.have.length(241);
                });
        });

        it("do not crashes on invalid texts", function() {
            return httpRequest.getText(SAMPLES_URL + "binary.bin")
                .then(function(result) {
                    expect(result).to.be.a("string");
                    expect(result).to.have.length(6);
                });
        });

        it("can report HTTP errors", function() {
            return httpRequest.getText(SAMPLES_URL + "404")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error).to.match(/HttpStatus404/);
                });
        });

    });

    describe("getJson", function() {

        it("can retrieve and parse a JSON file", function() {
            return httpRequest.getJson(SAMPLES_URL + "json-ok.json")
                .then(function(result) {
                    expect(result).to.be.an("object");
                    expect(result).to.only.have.key("test");
                    expect(result.test).to.equal("ok");
                });
        });

        it("can report unvalid JSON (from a corrupted JSON)", function() {
            return httpRequest.getJson(SAMPLES_URL + "json-corrupted.json")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error).to.match(/NotAValidJson/);
                });
        });

        it("can report unvalid JSON (from a non-JSON file)", function() {
            return httpRequest.getJson(SAMPLES_URL + "text-ascii.txt")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error).to.match(/NotAValidJson/);
                });
        });

        it("can report HTTP errors", function() {
            return httpRequest.getJson(SAMPLES_URL + "404")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error).to.match(/HttpStatus404/);
                });
        });

    });

    describe("getRawProxy", function() {

        it("can retrieve an ASCII text file", function() {
            return httpRequest.getRawProxy(SAMPLES_URL + "text-ascii.txt")
                .then(function(result) {
                    expect(result).to.be.a(Buffer);
                    expect(result).to.have.length(91);
                });
        });

        it("can retrieve a binary file", function() {
            return httpRequest.getRawProxy(SAMPLES_URL + "binary.bin")
                .then(function(result) {
                    expect(result).to.be.a(Buffer);
                    expect(result).to.have.length(6);
                    expect(result[0]).to.equal(0x00);
                    expect(result[1]).to.equal(0xBA);
                    expect(result[2]).to.equal(0xDD);
                    expect(result[3]).to.equal(0xCA);
                    expect(result[4]).to.equal(0xFE);
                    expect(result[5]).to.equal(0xFF);
                });
        });

        it("can retrieve large files", function() {
            return httpRequest.getRawProxy(SAMPLES_URL + "large-file.png")
                .then(function(result) {
                    expect(result).to.be.a(Buffer);
                    expect(result).to.have.length(633203);
                });
        });

        it("can report HTTP errors", function() {
            return httpRequest.getRawProxy(SAMPLES_URL + "404")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error).to.match(/HttpStatus404/);
                });
        });

        // Skipped because it makes tests timeout...
        it.skip("can report non-HTTP errors", function() {
            return httpRequest.getRawProxy("http://test.nowhere/")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error).to.match(/HttpConnexionError/);
                });
        });

    });

    describe("getTextProxy", function() {

        it("can retrieve an ASCII text file", function() {
            return httpRequest.getTextProxy(SAMPLES_URL + "text-ascii.txt")
                .then(function(result) {
                    expect(result).to.be.a("string");
                    expect(result).to.have.length(91);
                });
        });

        it("can retrieve an UTF-8 text file", function() {
            return httpRequest.getTextProxy(SAMPLES_URL + "text-utf8.txt")
                .then(function(result) {
                    expect(result).to.be.a("string");
                    expect(result).to.have.length(241);
                });
        });

        it("do not crashes on invalid texts", function() {
            return httpRequest.getTextProxy(SAMPLES_URL + "binary.bin")
                .then(function(result) {
                    expect(result).to.be.a("string");
                    expect(result).to.have.length(6);
                });
        });

        it("can report HTTP errors", function() {
            return httpRequest.getTextProxy(SAMPLES_URL + "404")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error).to.match(/HttpStatus404/);
                });
        });

    });

    describe("getJsonProxy", function() {

        it("can retrieve and parse a JSON file", function() {
            return httpRequest.getJsonProxy(SAMPLES_URL + "json-ok.json")
                .then(function(result) {
                    expect(result).to.be.an("object");
                    expect(result).to.only.have.key("test");
                    expect(result.test).to.equal("ok");
                });
        });

        it("can report unvalid JSON (from a corrupted JSON)", function() {
            return httpRequest.getJsonProxy(SAMPLES_URL + "json-corrupted.json")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error).to.match(/NotAValidJson/);
                });
        });

        it("can report unvalid JSON (from a non-JSON file)", function() {
            return httpRequest.getJsonProxy(SAMPLES_URL + "text-ascii.txt")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error).to.match(/NotAValidJson/);
                });
        });

        it("can report HTTP errors", function() {
            return httpRequest.getJsonProxy(SAMPLES_URL + "404")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error).to.match(/HttpStatus404/);
                });
        });

    });

    describe("*Proxy", function() {

        it("can define custom headers for the proxy request", function() {
            return httpRequest.getJsonProxy(ROOT_URL + "/echo-headers", {
                    headers: {
                        "x-test-header": "ok",
                        "user-agent": "test-ua",
                        "Referer": "http://fake.referer/"
                    }
                })
                .then(function(result) {
                    expect(result).to.have.keys("x-test-header", "user-agent", "referer");
                    expect(result["x-test-header"]).to.equal("ok");
                    expect(result["user-agent"]).to.equal("test-ua");
                    expect(result["referer"]).to.equal("http://fake.referer/");
                });
        });

        it("can define allowed mimetypes of the response (ok)", function() {
            return httpRequest.getRawProxy(SAMPLES_URL + "text-ascii.txt", {
                    allowedMimes: ["text/plain"]
                })
                .then(function(result) {
                    expect(result).to.have.length(91);
                });
        });

        it("can define allowed mimetypes of the response (not ok)", function() {
            return httpRequest.getRawProxy(SAMPLES_URL + "text-ascii.txt", {
                    allowedMimes: ["image/png"]
                })
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error).to.match(/HttpStatus406/);
                });
        });

        it("cannot download files that are too large", function() {
            return httpRequest.getRawProxy(ROOT_URL + "/large-content")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error).to.match(/HttpStatus413/);
                });
        });

    });

});
