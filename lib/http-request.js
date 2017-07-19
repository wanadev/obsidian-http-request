"use strict";

var Q = require("q");
var url = require("url");
var http = require("http");
var lodash = require("lodash");

var httpRequest;

// check fiew things
function _checkHeaders(response) {
    if (response.statusCode === 0) {
        throw new Error("HttpConnectionError");
    }
    if (response.statusCode != 200) {
        throw new Error("HttpStatus" + response.statusCode);
    }
    return response;
}

// read the entire data and put it in response.body
function _readBody(response) {
    return Q.Promise(function(resolve, reject) {
        var data = [];
        var dataLength = 0;

        response.on("data", function(chunk) {
            data.push(chunk);
            dataLength += chunk.length;
        });

        response.on("end", function() {
            try {
                response.body = Buffer.concat(data, dataLength);
                resolve(response);
            } catch (error) {
                reject(error);
            }
        });
    });
}

// converts the body into a String (Buffer -> String)
function _bodyToString(response) {
    response.body = response.body.toString("utf-8");
    return response;
}

// converts the body into javascript objects (JSON String -> Object)
function _bodyParseJson(response) {
    if (typeof response.body != "string") {
        response = _bodyToString(response);
    }
    try {
        response.body = JSON.parse(response.body);
    } catch (error) {
        throw new Error("NotAValidJson");
    }
    return response;
}

// return the body
function _returnBody(response) {
    return response.body;
}

// make request without proxy
function _request(requestUrl, options) {
    options = lodash.merge({
        method: "GET",
        headers: {},
        body: null
    }, options || {});

    requestUrl = url.resolve(window.location.href, requestUrl);

    var parsedUrl = url.parse(requestUrl);

    var httpOptions = {
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || ((parsedUrl.protocol == "https:") ? 443 : 80),
        path: parsedUrl.path,
        method: options.method,
        headers: options.headers
    };

    return Q.Promise(function(resolve, reject) {
        var req = http.request(httpOptions, resolve)
            .on("error", reject);
        if (options.body !== null && options.body !== undefined) {
            req.write(options.body);
        }
        req.end();
    });
}

// make request through the proxy
function _requestProxy(requestUrl, options) {
    options = lodash.merge({
        method: "GET",
        headers: {},
        body: null,  // must be a buffer or null
        allowedMimes: []
    }, options || {});

    requestUrl = url.resolve(window.location.href, requestUrl);

    var httpOptions = {
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        port: window.location.port || ((window.location.protocol == "https:") ? 443 : 80),
        path: httpRequest.proxyPath,
        method: "POST",
        headers: {
            "content-type": "application/json"
        }
    };

    return Q.Promise(function(resolve, reject) {
        var req = http.request(httpOptions, resolve)
            .on("error", reject);
        req.write(JSON.stringify({
            url: requestUrl,
            method: options.method,
            headers: options.headers || {},
            allowedMimes: options.allowedMimes || [],
            body: options.body ? options.body.tostring("base64") : null
        }));
        req.end();
    });
}

/**
 * @class http-request
 */
httpRequest = {

    /**
     * The path of the proxy on the server.
     *
     * @property proxyPath
     * @type String
     * @default "/proxy"
     */
    proxyPath: "/proxy",

    /**
     * Retrieve any file as a raw Node.js Buffer (HTTP GET).
     *
     * @method getRaw
     * @param {String} url The URL of the file
     * @param {Function} callback A Node-like callback (optional)
     * @return {Q.Promise}
     */
    getRaw: function(url, callback) {
        return _request(url)
            .then(_checkHeaders)
            .then(_readBody)
            .then(_returnBody)
            .nodeify(callback);
    },

    /**
     * Retrieve any file as a String (HTTP GET).
     *
     * @method getText
     * @param {String} url The URL of the file
     * @param {Function} callback A Node-like callback (optional)
     * @return {Q.Promise}
     */
    getText: function(url, callback) {
        return _request(url)
            .then(_checkHeaders)
            .then(_readBody)
            .then(_bodyToString)
            .then(_returnBody)
            .nodeify(callback);
    },

    /**
     * Retrieve a JSON file (HTTP GET)
     *
     * The result of this function is a plain Javascript object (parsed JSON).
     *
     * @method getJson
     * @param {String} url The URL of the JSON file
     * @param {Function} callback A Node-like callback (optional)
     * @return {Q.Promise}
     */
    getJson: function(url, callback) {
        return _request(url)
            .then(_checkHeaders)
            .then(_readBody)
            .then(_bodyToString)
            .then(_bodyParseJson)
            .then(_returnBody)
            .nodeify(callback);
    },

    /**
     * Make an HTTP request
     *
     * The result of this function is a Node Buffer.
     *
     * @method request
     * @param {String} url The URL of the request
     * @param {Object} options The options of the request (optional)
     * @param {String} options.method The HTTP method to use (default: `GET`)
     * @param {Object} options.headers Additionnal HTTP headers (e.g. `{"content-type": "application/json"}`, default: `{}`)
     * @param {Buffer} options.body The body of the request (default: `null`)
     * @param {Function} callback A Node-like callback (optional)
     */
    request: function(url, options, callback) {
        if (typeof(options) == "function") {
            callback = options;
            options = {};
        }
        return _request(url, options)
            .then(_checkHeaders)
            .then(_readBody)
            .then(_returnBody)
            .nodeify(callback);
    },

    /**
     * Retrieve any file as a raw Node.js Buffer through the Obsidian Proxy Server (HTTP GET).
     *
     * @method getRawProxy
     * @param {String} url The URL of the file
     * @param {Object} options Any options for Obsidian Proxy Server (optional)
     * @param {Function} callback A Node-like callback (optional)
     * @return {Q.Promise}
     */
    getRawProxy: function(url, options, callback) {
        return _requestProxy(url, options)
            .then(_checkHeaders)
            .then(_readBody)
            .then(_returnBody)
            .nodeify(callback);
    },

    /**
     * Retrieve any file as a String through the Obsidian Proxy Server (HTTP GET).
     *
     * @method getRawProxy
     * @param {String} url The URL of the file
     * @param {Object} options Any options for Obsidian Proxy Server (optional)
     * @param {Function} callback A Node-like callback (optional)
     * @return {Q.Promise}
     */
    getTextProxy: function(url, options, callback) {
        return _requestProxy(url, options)
            .then(_checkHeaders)
            .then(_readBody)
            .then(_bodyToString)
            .then(_returnBody)
            .nodeify(callback);
    },

    /**
     * Retrieve a JSON file through Obsidian Proxy Server (HTTP GET)
     *
     * @method getJsonProxy
     * @param {String} url The URL of the JSON file
     * @param {Object} options Any options for Obsidian Proxy Server (optional)
     * @param {Function} callback A Node-like callback (optional)
     * @return {Q.Promise}
     */
    getJsonProxy: function(url, options, callback) {
        return _requestProxy(url, options)
            .then(_checkHeaders)
            .then(_readBody)
            .then(_bodyToString)
            .then(_bodyParseJson)
            .then(_returnBody)
            .nodeify(callback);
    },

    /**
     * Make an HTTP request through the Obsidian Proxy Server
     *
     * The result of this function is a Node Buffer.
     *
     * @method request
     * @param {String} url The URL of the request
     * @param {Object} options The options of the request (optional)
     * @param {String} options.method The HTTP method to use (default: `GET`)
     * @param {Object} options.headers Additionnal HTTP headers (e.g. `{"content-type": "application/json"}`, default: `{}`)
     * @param {Buffer} options.body The body of the request (default: `null`)
     * @param {Array} options.allowedMimes The allowed mime (default: `[]`)
     */
    requestProxy: function(url, options) {
        // TODO
    },

    /**
     * Low-level operations.
     *
     * @property _operations
     * @private
     */
    _operations: {
        _request: _request,
        _requestProxy: _requestProxy,
        _checkHeaders: _checkHeaders,
        _readBody: _readBody,
        _bodyToString: _bodyToString,
        _bodyParseJson: _bodyParseJson,
        _returnBody: _returnBody
    }
};

module.exports = httpRequest;
