"use strict";

var expect = require("expect.js");
var httpRequest = require("../lib/");

describe("http-request", function() {

    describe("get", function() {

        it("can retrieve an ASCII text file", function() {
            return httpRequest.get(window.location + "/samples/text-ascii.txt")
                .then(function(result) {
                    expect(result).to.be.a("string");
                    expect(result).to.have.length(91);
                });
        });

        it("can retrieve an UTF-8 text file", function() {
            return httpRequest.get(window.location + "/samples/text-utf8.txt")
                .then(function(result) {
                    expect(result).to.be.a("string");
                    expect(result).to.have.length(241);
                });
        });

        it("can retrieve a JSON file", function() {
            return httpRequest.get(window.location + "/samples/json-ok.json")
                .then(function(result) {
                    expect(result).to.be.a("string");
                    expect(result).to.have.length(15);
                });
        });

        it("can retrieve a binary file", function() {
            return httpRequest.get(window.location + "/samples/binary.bin")
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
            return httpRequest.get(window.location + "/samples/large-file.png")
                .then(function(result) {
                    expect(result).to.be.a(Buffer);
                    expect(result).to.have.length(633203);
                });
        });


        it("can report HTTP errors", function() {
            return httpRequest.get(window.location + "/samples/404")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error).to.match(/HttpStatus404/);
                });
        });

        // Skipped because it makes tests timeout...
        it.skip("can report non-HTTP errors", function() {
            return httpRequest.get("http://test.nowhere/")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error).to.match(/HttpConnexionError/);
                });
        });

    });

    describe("getJson", function() {

        it("can retrieve and parse a JSON file", function() {
            return httpRequest.getJson(window.location + "/samples/json-ok.json")
                .then(function(result) {
                    expect(result).to.be.an("object");
                    expect(result).to.only.have.key("test");
                    expect(result.test).to.equal("ok");
                });
        });

        it("can report unvalid JSON (from a corrupted JSON)", function() {
            return httpRequest.getJson(window.location + "/samples/json-corrupted.json")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error).to.match(/NotAValidJson/);
                });
        });

        it("can report unvalid JSON (from a non-JSON file)", function() {
            return httpRequest.getJson(window.location + "/samples/text-ascii.txt")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error).to.match(/NotAValidJson/);
                });
        });

        it("can report HTTP errors", function() {
            return httpRequest.getJson(window.location + "/samples/404")
                .then(function(result) {
                    throw new Error("ShouldNotBeCalled");
                })
                .catch(function(error) {
                    expect(error).to.match(/HttpStatus404/);
                });
        });

    });

    //describe("getProxy", function() {

        //it("can retrieve large files", function() {
            //return httpRequest.getProxy(window.location + "/samples/large-file.png")
                //.then(function(result) {
                    //expect(result).to.be.a(Buffer);
                    //expect(result).to.have.length(636407);
                //});
        //});

    //});

});
