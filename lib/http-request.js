"use strict";

var url = require("url");
var http = require("http");

var httpRequest;

/**
 * check fiew things
 *
 * @param {import("http").IncomingMessage} response
 * @returns {import("http").IncomingMessage}
 */
function _checkHeaders(response) {
    var error;
    if (response.statusCode === 0) {
        error = new Error("HttpConnectionError");
        throw error;
    }
    if (response.statusCode < 200 || response.statusCode > 299) {
        error = new Error("HttpStatus" + response.statusCode);
        error.statusCode = response.statusCode;
        error.statusMessage = response.statusMessage;
        throw error;
    }
    return response;
}

// read the entire data and put it in response.body
function _readBody(response) {
    return new Promise(function(resolve, reject) {
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

// converts the body into Blob (Buffer -> Blob)
function _bodyToBlob(response) {
    var mimetype = "application/octet-stream";
    if (response.headers["content-type"]) {
        mimetype = response.headers["content-type"];
    }
    response.body = new Blob([response.body], {type: mimetype});
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
        var notValidError = new Error("NotAValidJson");
        notValidError.statusCode = response.statusCode;
        notValidError.statusMessage = response.statusMessage;
        notValidError.cause = error;
        throw notValidError;
    }
    return response;
}

// return the body
function _returnBody(response) {
    return response.body;
}

// make request without proxy
function _request(requestUrl, options) {
    options = options || {};
    options = {
        method: options.method || "GET",
        headers: options.headers || {},
        body: options.body || null  // Must be a Node Buffer or null
    };

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

    return new Promise(function(resolve, reject) {
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
    options = options || {};
    options = {
        method: options.method || "GET",
        headers: options.headers || {},
        body: options.body || null,  // Must be a Node Buffer or null
        allowedMimes: options.allowedMimes || []
    };

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

    return new Promise(function(resolve, reject) {
        var req = http.request(httpOptions, resolve)
            .on("error", reject);
        req.write(JSON.stringify({
            url: requestUrl,
            method: options.method,
            headers: options.headers || {},
            allowedMimes: options.allowedMimes || [],
            body: options.body ? options.body.toString("base64") : null
        }));
        req.end();
    });
}

/**
 * Nodeify given promise with optional callback
 *
 * @param {Promise} promise 
 * @param {Function} [callback]
 * @returns {Promise}
 */
function _nodeify(promise, callback) {
    if (typeof(callback) !== "function") {
        return promise;
    }

    return promise.then(function(value) {
        callback(null, value);
    }, function(error) {
        callback(error);
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
     * @return {Promise}
     */
    getRaw: function(url, callback) {
        var p = _request(url)
            .then(_checkHeaders)
            .then(_readBody)
            .then(_returnBody)
            .catch(function (error) {
                error.message = "Error getting raw for " + url + " | " + error.message;
                throw error;
            });
        return _nodeify(p, callback);
    },

    /**
     * Retrieve any file as a Blob (HTTP GET).
     *
     * @method getBlob
     * @param {String} url The URL of the file
     * @param {Function} callback A Node-like callback (optional)
     * @return {Promise}
     */
    getBlob: function(url, callback) {
        var p = _request(url)
            .then(_checkHeaders)
            .then(_readBody)
            .then(_bodyToBlob)
            .then(_returnBody)
            .catch(function (error) {
                error.message = "Error getting Blob for " + url + " | " + error.message;
                throw error;
            });
        return _nodeify(p, callback);
    },

    /**
     * Retrieve any file as a String (HTTP GET).
     *
     * @method getText
     * @param {String} url The URL of the file
     * @param {Function} callback A Node-like callback (optional)
     * @return {Promise}
     */
    getText: function(url, callback) {
        var p = _request(url)
            .then(_checkHeaders)
            .then(_readBody)
            .then(_bodyToString)
            .then(_returnBody)
            .catch(function (error) {
                error.message = "Error getting text for " + url + " | " + error.message;
                throw error;
            });
        return _nodeify(p, callback);
    },

    /**
     * Retrieve a JSON file (HTTP GET)
     *
     * The result of this function is a plain Javascript object (parsed JSON).
     *
     * @method getJson
     * @param {String} url The URL of the JSON file
     * @param {Function} callback A Node-like callback (optional)
     * @return {Promise}
     */
    getJson: function(url, callback) {
        var p = _request(url)
            .then(_checkHeaders)
            .then(_readBody)
            .then(_bodyToString)
            .then(_bodyParseJson)
            .then(_returnBody)
            .catch(function (error) {
                error.message = "Error getting JSON for " + url + " | " + error.message;
                throw error;
            });
        return _nodeify(p, callback);
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
        var p = _request(url, options)
            .then(_checkHeaders)
            .then(_readBody)
            .then(_returnBody)
            .catch(function (error) {
                error.message = "Error resquesting for " + url + " | " + error.message;
                throw error;
            });
        return _nodeify(p, callback);
    },

    /**
     * Retrieve any file as a raw Node.js Buffer through the Obsidian Proxy Server (HTTP GET).
     *
     * @method getRawProxy
     * @param {String} url The URL of the file
     * @param {Object} options Any options for Obsidian Proxy Server (optional)
     * @param {Function} callback A Node-like callback (optional)
     * @return {Promise}
     */
    getRawProxy: function(url, options, callback) {
        var p = _requestProxy(url, options)
            .then(_checkHeaders)
            .then(_readBody)
            .then(_returnBody)
            .catch(function (error) {
                error.message = "Error getting raw via proxy for " + url + " | " + error.message;
                throw error;
            });
        return _nodeify(p, callback);
    },

    /**
     * Retrieve any file as a Blob through the Obsidian Proxy Server (HTTP GET).
     *
     * @method getBlobProxy
     * @param {String} url The URL of the file
     * @param {Object} options Any options for Obsidian Proxy Server (optional)
     * @param {Function} callback A Node-like callback (optional)
     * @return {Promise}
     */
    getBlobProxy: function(url, options, callback) {
        var p = _requestProxy(url, options)
            .then(_checkHeaders)
            .then(_readBody)
            .then(_bodyToBlob)
            .then(_returnBody)
            .catch(function (error) {
                error.message = "Error getting Blob via proxy for " + url + " | " + error.message;
                throw error;
            });
        return _nodeify(p, callback);
    },

    /**
     * Retrieve any file as a String through the Obsidian Proxy Server (HTTP GET).
     *
     * @method getRawProxy
     * @param {String} url The URL of the file
     * @param {Object} options Any options for Obsidian Proxy Server (optional)
     * @param {Function} callback A Node-like callback (optional)
     * @return {Promise}
     */
    getTextProxy: function(url, options, callback) {
        var p = _requestProxy(url, options)
            .then(_checkHeaders)
            .then(_readBody)
            .then(_bodyToString)
            .then(_returnBody)
            .catch(function (error) {
                error.message = "Error getting text via proxy for " + url + " | " + error.message;
                throw error;
            });
        return _nodeify(p, callback);
    },

    /**
     * Retrieve a JSON file through Obsidian Proxy Server (HTTP GET)
     *
     * @method getJsonProxy
     * @param {String} url The URL of the JSON file
     * @param {Object} options Any options for Obsidian Proxy Server (optional)
     * @param {Function} callback A Node-like callback (optional)
     * @return {Promise}
     */
    getJsonProxy: function(url, options, callback) {
        var p = _requestProxy(url, options)
            .then(_checkHeaders)
            .then(_readBody)
            .then(_bodyToString)
            .then(_bodyParseJson)
            .then(_returnBody)
            .catch(function (error) {
                error.message = "Error getting JSON via proxy for " + url + " | " + error.message;
                throw error;
            });
        return _nodeify(p, callback);
    },

    /**
     * Make an HTTP request through the Obsidian Proxy Server
     *
     * The result of this function is a Node Buffer.
     *
     * @method requestProxy
     * @param {String} url The URL of the request
     * @param {Object} options The options of the request (optional)
     * @param {String} options.method The HTTP method to use (default: `GET`)
     * @param {Object} options.headers Additionnal HTTP headers (e.g. `{"content-type": "application/json"}`, default: `{}`)
     * @param {Buffer} options.body The body of the request (default: `null`)
     * @param {Array} options.allowedMimes The allowed mime (default: `[]`)
     * @param {Function} callback A Node-like callback (optional)
     */
    requestProxy: function(url, options, callback) {
        if (typeof(options) == "function") {
            callback = options;
            options = {};
        }
        var p = _requestProxy(url, options)
            .then(_checkHeaders)
            .then(_readBody)
            .then(_returnBody)
            .catch(function (error) {
                error.message = "Error resquesting proxy for " + url + " | " + error.message;
                throw error;
            });
        return _nodeify(p, callback);
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
