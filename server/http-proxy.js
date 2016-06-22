"use strict";

var url = require("url");
var http = require("http");
var https = require("https");
var lodash = require("lodash");

var Q = require("q");

var DEFAULT_OPTIONS = {
    maxContentLength: 5 * 1024 * 1024,  // 5 MiB
    allowedPorts: [80, 443]
};

module.exports = function(params) {
    var options = lodash.clone(DEFAULT_OPTIONS);
    lodash.merge(options, params);

    function proxyMiddleware(req, res, next) {

        // Checks request

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

        proxyOptions.headers = proxyOptions.headers || {};
        proxyOptions.allowedMimes = proxyOptions.allowedMimes || [];

        var parsedUrl = url.parse(proxyOptions.url);

        if (!parsedUrl.protocol || (parsedUrl.protocol != "http:" && parsedUrl.protocol != "https:") || !parsedUrl.hostname) {
            res.sendStatus(400);
            next();
            return;
        }

        if (!parsedUrl.port) {
            parsedUrl.port = (parsedUrl.protocol == "https:") ? 443 : 80;
        }

        if (options.allowedPorts.indexOf(Number(parsedUrl.port)) < 0) {
            res.sendStatus(400);
            next();
            return;
        }

        // Retrieve requested content and forward it

        var httpHeaders = {
            "user-agent": req.headers["user-agent"] || "Obsidian Proxy Server",
            "referer": parsedUrl.protocol + "//" + parsedUrl.host + parsedUrl.path
        };

        lodash.merge(httpHeaders, proxyOptions.headers || {});

        var httpOptions = {
            protocol: parsedUrl.protocol,
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.path,
            method: "GET",
            headers: httpHeaders
        };

        Q.Promise(function(resolve, reject) {
                var httpModule = (httpOptions.protocol == "https:") ? https : http;
                var request = httpModule.request(httpOptions, resolve)
                    .on("error", reject);
                request.end();
            })
            .then(function(response) {
                var error;
                if (response.statusCode != 200) {
                    error = new Error("HttpStatus" + response.statusCode);
                    error.statusCode = 404;
                    throw error;
                }
                if (proxyOptions.allowedMimes.length > 0) {
                    if (!response.headers["content-type"]) {
                        error = new Error("MimeNotAllowed");
                        error.statusCode = 406;
                        throw error;
                    }
                    var mime = response.headers["content-type"].split(";")[0].toLowerCase();
                    if (proxyOptions.allowedMimes.indexOf(mime) < 0) {
                        error = new Error("MimeNotAllowed");
                        error.statusCode = 406;
                        throw error;
                    }
                }
                if (response.headers["content-length"]) {
                    var contentLength = Number(response.headers["content-length"]);
                    if (contentLength > options.maxContentLength) {
                        error = new Error("ContentTooLarge");
                        error.statusCode = 413;
                        throw error;
                    }
                }
                return response;
            })
            .then(function(response) {
                var contentLength = 0;

                res.set("Content-Type", response.headers["content-type"] || "application/octet-stream");
                if (response.headers["content-length"]) {
                    res.set("Content-Length", response.headers["content-length"]);
                }

                response.on("data", function(chunk) {
                    res.write(chunk);
                    contentLength += chunk.length;
                    if (contentLength > options.maxContentLength) {
                        response.destroy();
                        res.end();
                        next();
                    }
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
