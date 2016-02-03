"use strict";

var url = require("url");
var http = require("http");
var lodash = require("lodash");

var Q = require("q");

module.exports = function(options) {

    function proxyMiddleware(req, res, next) {

        // jshint ignore:start
        console.log("=================");
        console.log(req.body.toString());
        // jshint ignore:end

        // Checks

        if (req.method != "POST" || !(req.body instanceof Buffer)) {
            res.sendStatus(400);
            next();
            return;
        }

        var proxyOptions;

        try {
            proxyOptions = JSON.parse(req.body.toString());
        } catch (error) {
            res.sendStatus(400);
            next();
            return;
        }

        if (proxyOptions === null || !proxyOptions.url) {
            res.sendStatus(400);
            next();
            return;
        }

        var parsedUrl = url.parse(proxyOptions.url);

        if (!parsedUrl.protocol || (parsedUrl.protocol != "http:" && parsedUrl.protocol != "https:") || !parsedUrl.hostname) {
            res.sendStatus(400);
            next();
            return;
        }

        // TODO check port / protocol

        // Retrieve requested content and forward it

        var httpHeaders = {
            "user-agent": req.headers["user-agent"] || "Wanaplan Proxy Server",
            "referer": parsedUrl.protocol + "//" + parsedUrl.host + parsedUrl.path
        };

        lodash.merge(httpHeaders, proxyOptions.headers || {});

        var httpOptions = {
            protocol: parsedUrl.protocol,
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || ((parsedUrl.protocol == "https:") ? 443 : 80),
            path: parsedUrl.path,
            method: "GET",
            headers: httpHeaders
        };

        Q.Promise(function(resolve, reject) {
                var request = http.request(httpOptions, resolve)
                    .on("error", reject);
                request.end();
            })
            .then(function(response) {
                if (response.statusCode != 200) {
                    var error = new Error("HttpStatus" + response.statusCode);
                    error.statusCode = 404;
                    throw error;
                }
                // TODO check content-type
                // TODO check content-length
                return response;
            })
            .then(function(response) {
                // TODO check content-length

                res.set("Content-Type", response.headers["content-type"] || "application/octet-stream");
                if (response.headers["content-length"]) {
                    res.set("Content-Length", response.headers["content-length"]);
                }

                response.on("data", function(chunk) {
                    res.write(chunk);
                });

                response.on("end", function() {
                    res.end();
                    next();
                });
            })
            .catch(function(error) {
                res.sendStatus(error.statusCode || 500);
                next();
            });
    }

    return proxyMiddleware;
};
