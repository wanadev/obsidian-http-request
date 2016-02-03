"use strict";

var express = require("express");
var bodyParser = require("body-parser");
var proxyMiddleware = require("../../server/http-proxy.js");

var PORT = process.env.PORT || 3042;

var app = express();

app.get("/echo-headers", function(req, res) {
    res.send(JSON.stringify(req.headers));
});

app.get("/large-content", function(req, res) {
    var buffer = new Buffer(6 * 1024 * 1024);  // 6 MiB
    res.send(buffer);
});


app.use("/proxy", bodyParser.raw({type: "application/json"}));
app.use("/proxy", proxyMiddleware());

app.use("/mocha/", express.static(__dirname + "/../../node_modules/mocha/"));
app.use("/", express.static(__dirname));

console.log("Starting Obsidian HTTP Request Proxy Test Server on 0.0.0.0:" + PORT);  // jshint ignore:line
app.listen(PORT);
