"use strict";

var express = require("express");
var bodyParser = require("body-parser");
var proxyMiddleware = require("../../server/http-proxy.js");

var PORT = process.env.PORT || 3042;

var app = express();

app.use("/mocha/", express.static(__dirname + "/../../node_modules/mocha/"));
app.use("/", express.static(__dirname));

app.use("/proxy", bodyParser.raw({type: "application/json"}));
app.use("/proxy", proxyMiddleware());

console.log("Starting Obsidian HTTP Request Proxy Test Server on 0.0.0.0:" + PORT);  // jshint ignore:line
app.listen(PORT);
