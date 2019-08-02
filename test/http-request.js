"use strict";

var expect = require("expect.js");
var httpRequest = require("../lib/");

var ROOT_URL = window.location.protocol + "//" + window.location.host;
var SAMPLES_URL = ROOT_URL + "/samples/";
var HTTPS_IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Collage_of_Six_Cats-02.jpg/1024px-Collage_of_Six_Cats-02.jpg";

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

        it("can report HTTP errors with status code and message", function() {
            return httpRequest.getRaw(SAMPLES_URL + "404")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error.response).to.be.an(Object);
                    expect(error.statusCode).to.be(404);
                    expect(error.statusMessage).to.be.a("string");
                });
        });

        // Skipped because it makes tests timeout...
        it.skip("can report non-HTTP errors", function() {
            return httpRequest.getRaw("http://test.nowhere/")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error).to.match(/HttpConnectionError/);
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

        it("can report HTTP errors with status code and message", function() {
            return httpRequest.getText(SAMPLES_URL + "404")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error.response).to.be.an(Object);
                    expect(error.statusCode).to.be(404);
                    expect(error.statusMessage).to.be.a("string");
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

        it("can report unvalid JSON (from a corrupted JSON) with status code and message", function() {
            return httpRequest.getJson(SAMPLES_URL + "json-corrupted.json")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error.response).to.be.an(Object);
                    expect(error.statusCode).to.be(200);
                    expect(error.statusMessage).to.be.a("string");
                    expect(error.cause).to.be.an(Error);
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

        it("can report unvalid JSON (from a non-JSON file) with response and cause", function() {
            return httpRequest.getJson(SAMPLES_URL + "text-ascii.txt")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error.response).to.be.an(Object);
                    expect(error.statusCode).to.be(200);
                    expect(error.statusMessage).to.be.a("string");
                    expect(error.cause).to.be.an(Error);
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

        it("can report HTTP errors with status code and message", function() {
            return httpRequest.getJson(SAMPLES_URL + "404")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error.response).to.be.an(Object);
                    expect(error.statusCode).to.be(404);
                    expect(error.statusMessage).to.be.a("string");
                });
        });

    });

    describe("request", function() {

        it("uses GET as default method", function() {
            return httpRequest.request(SAMPLES_URL + "binary.bin")
                .then(function(data) {
                    expect(data.readUInt32BE(1)).to.equal(0xBADDCAFE);
                });
        });

        it("can use POST method and send custom body", function() {
            var body = Buffer.from("ABCDÉ\x00\xFF");
            return httpRequest.request("/echo-body", {
                method: "POST",
                body: body,
                headers: {
                    "content-type": "application/octet-stream"
                }
            })
                .then(function(data) {
                    expect(data).to.eql(body);
                    expect(data.toString("ascii", 0, 4)).to.equal("ABCD");
                });
        });

        it("can set custom headers", function() {
            return httpRequest.request("/echo-headers", {
                method: "GET",
                headers: {
                    "x-foobar": "baz"
                }
            })
                .then(function(rawResult) {
                    var result = JSON.parse(rawResult.toString());
                    expect(result["x-foobar"]).to.equal("baz");
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

        it("can report HTTP errors with status code and message", function() {
            return httpRequest.getRawProxy(SAMPLES_URL + "404")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error.response).to.be.an(Object);
                    expect(error.statusCode).to.be(404);
                    expect(error.statusMessage).to.be.a("string");
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

        it("can report HTTP errors with status code and message", function() {
            return httpRequest.getTextProxy(SAMPLES_URL + "404")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error.response).to.be.an(Object);
                    expect(error.statusCode).to.be(404);
                    expect(error.statusMessage).to.be.a("string");
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

        it("can report unvalid JSON (from a corrupted JSON) with status code and message", function() {
            return httpRequest.getJsonProxy(SAMPLES_URL + "json-corrupted.json")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error.response).to.be.an(Object);
                    expect(error.statusCode).to.be(200);
                    expect(error.statusMessage).to.be.a("string");
                    expect(error.cause).to.be.an(Error);
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

        it("can report unvalid JSON (from a non-JSON file) with response and cause", function() {
            return httpRequest.getJsonProxy(SAMPLES_URL + "text-ascii.txt")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error.response).to.be.an(Object);
                    expect(error.statusCode).to.be(200);
                    expect(error.statusMessage).to.be.a("string");
                    expect(error.cause).to.be.an(Error);
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

        it("can report HTTP errors with status code and message", function() {
            return httpRequest.getJsonProxy(SAMPLES_URL + "404")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error.response).to.be.an(Object);
                    expect(error.statusCode).to.be(404);
                    expect(error.statusMessage).to.be.a("string");
                });
        });

    });

    describe("requestProxy", function() {

        it("uses GET as default method", function() {
            return httpRequest.requestProxy(SAMPLES_URL + "binary.bin")
                .then(function(data) {
                    expect(data.readUInt32BE(1)).to.equal(0xBADDCAFE);
                });
        });

        it("can use POST method and send custom body", function() {
            var body = Buffer.from("ABCDÉ\x00\xFF");
            return httpRequest.requestProxy("/echo-body", {
                method: "POST",
                body: body,
                headers: {
                    "content-type": "application/octet-stream"
                }
            })
                .then(function(data) {
                    expect(data).to.eql(body);
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

        it("report success on 2xx HTTP status", function() {
            return httpRequest.getRawProxy(ROOT_URL + "/status-201");
        });

        it("can retrieve files through HTTPS", function() {
            return httpRequest.getRawProxy(HTTPS_IMAGE_URL)
                .then(function(result) {
                    expect(result).to.be.a(Buffer);
                    expect(result[0]).to.equal(0xFF);
                    expect(result[1]).to.equal(0xD8);
                    expect(result[2]).to.equal(0xFF);
                    expect(result[3]).to.equal(0xE0);
                    expect(result[4]).to.equal(0x00);
                    expect(result[5]).to.equal(0x10);
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
                    expect(error.response).to.be.an(Object);
                    expect(error.statusCode).to.be(406);
                    expect(error.statusMessage).to.be.a("string");
                });
        });

        it("cannot download files that are too large", function() {
            return httpRequest.getRawProxy(ROOT_URL + "/large-content")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error).to.match(/HttpStatus413/);
                    expect(error.response).to.be.an(Object);
                    expect(error.statusCode).to.be(413);
                    expect(error.statusMessage).to.be.a("string");
                });
        });

        it("cannot download files from an URI that uses an unauthorized port", function() {
            return httpRequest.getRawProxy("http://localhost:6666/")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error).to.match(/HttpStatus400/);
                    expect(error.response).to.be.an(Object);
                    expect(error.statusCode).to.be(400);
                    expect(error.statusMessage).to.be.a("string");
                });
        });

        it("cannot download files from an URI that uses an unauthorized protocol", function() {
            return httpRequest.getRawProxy("spdy://localhost/")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error).to.match(/HttpStatus400/);
                    expect(error.response).to.be.an(Object);
                    expect(error.statusCode).to.be(400);
                    expect(error.statusMessage).to.be.a("string");
                });
        });

        it("can resolve relative URLs", function() {
            return httpRequest.getJsonProxy("./echo-headers", {
                    headers: {
                        "x-test-header": "ok",
                    }
                })
                .then(function(result) {
                    expect(result["x-test-header"]).to.equal("ok");
                });
        });

        it("cannot use forbiddenHTTP methods", function() {
            return httpRequest.requestProxy("/put-test", {
                method: "PUT"
            })
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error).to.match(/HttpStatus405/);
                    expect(error.response).to.be.an(Object);
                    expect(error.statusCode).to.be(405);
                    expect(error.statusMessage).to.be.a("string");
                });
        });

    });

});
