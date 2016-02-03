"use strict";

var url = require("url");
var http = require("http");
var lodash = require("lodash");

var Q = require("q");

module.exports = function(options) {

    function proxyMiddleware(req, res, next) {

        // jshint ignore:start
        console.log("=================");
        //console.log(req);
        console.log(req.method);
        console.log(req.headers);
        console.log(req.body);
        console.log(req.body.toString());
        // jshint ignore:end

        // Checks

        if (req.method != "POST" || !(req.body instanceof Buffer)) {
            res.sendStatus(400);
            next();
            return;
        }

        var data;

        try {
            data = JSON.parse(req.body.toString());
        } catch (error) {
            res.sendStatus(400);
            next();
            return;
        }

        if (data === null || !data.url) {
            res.sendStatus(400);
            next();
            return;
        }

        var parsedUrl = url.parse(data.url);

        if (!parsedUrl.protocol || (parsedUrl.protocol != "http:" && parsedUrl.protocol != "https:") || !parsedUrl.hostname) {
            res.sendStatus(400);
            next();
            return;
        }

        // Retrieve requested content and forward it

        var httpHeaders = {
            "user-agent": req.headers["user-agent"] || "Wanaplan Proxy Server",
            "referer": parsedUrl.protocol + "//" + parsedUrl.host + parsedUrl.path
        };

        lodash.merge(httpHeaders, data.headers || {});

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
                // TODO checks

                res.set("Content-Type", response.headers["content-type"] || "application/octet-stream");

                response.on("data", function(chunk) {
                    res.write(chunk);
                });

                response.on("end", function() {
                    res.end();
                    next();
                });
            })
            .catch(function(error) {
                res.sendStatus(404);
                next();
            });
    }

    return proxyMiddleware;
};
