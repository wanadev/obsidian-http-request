"use strict";

var http = require("http");
var Q = require("q");

// check fiew things
function _checkHeaders(response) {
    if (response.statusCode === 0) {
        throw new Error("HttpConnexionError");
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

        response.on("data", function(chunk) {
            data.push(chunk);
        });

        response.on("end", function() {
            try {
                response.body = Buffer.concat(data);
                resolve(response);
            } catch (error) {
                reject(error);
            }
        });
    });
}

// converts the body into a String (Buffer -> String)
function _bodyToString(response) {
    console.log(response); // jshint ignore:line
    var textEncoding = "ascii";
    if (response.headers["content-type"] && response.headers["content-type"].toLowerCase().indexOf("utf-8") >= 0) {
        textEncoding = "utf-8";
    }
    response.body = response.body.toString(textEncoding);
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

// Get data without proxy
function _get(url) {
    return Q.Promise(function(resolve, reject) {
            http.get(url, resolve)
                .on("error", reject);
        })
        .then(_checkHeaders)
        .then(_readBody);
}

/**
 * @class http-request
 */
var httpRequest = {

    /**
     * Retrieve any file as a raw Node.js Buffer (HTTP GET).
     *
     * @method getRaw
     * @param {String} url The URL of the file
     * @param {Function} callback A Node-like callback (optional)
     * @return {Q.Promise}
     */
    getRaw: function(url, callback) {
        return _get(url)
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
        return _get(url)
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
        return _get(url)
            .then(_bodyToString)
            .then(_bodyParseJson)
            .then(_returnBody)
            .nodeify(callback);
    },

    /**
     * Retrieve any file through Obsidian Proxy Server (HTTP GET).
     *
     * @method getProxy
     * @param {String} url The URL of the file
     * @param {Object} options Any options for Wanaplan's proxy server (optional)
     * @param {Function} callback A Node-like callback (optional)
     * @return {Q.Promise}
     */
    //getProxy: function(url, options, callback) {
        //options = options || {};
        //var httpOptions = {
            //protocol: window.location.protocol,
            //hostname: window.location.hostname,
            //port: window.location.port || ((window.location.protocol == "https:") ? 443 : 80),
            //path: "/wanaplan-proxy",
            //method: "POST",
            //headers: {
                //"content-type": "application/json"
            //}
        //};
        //return Q.Promise(function(resolve, reject) {
                //var req = http.request(httpOptions, resolve)
                    //.on("error", reject);
                //req.write(JSON.stringify({
                    //url: url,
                    //headers: options.headers || {},
                    //allowedMimes: options.allowedMimes || []
                //}));
                //req.end();
            //})
            //.then(_checkHeaders)
            //.then(_readBody)
            //.then(_convertAndReturnData)
            //.nodeify(callback);
    //},

    /**
     * Retrieve a JSON file through Obsidian Proxy Server (HTTP GET)
     *
     * @method getJsonProxy
     * @param {String} url The URL of the JSON file
     * @param {Function} callback A Node-like callback (optional)
     * @param {Object} options Any options for Wanaplan's proxy server (optional)
     * @return {Q.Promise}
     */
    //GetJsonProxy: function(url, options, callback) {
        //return Q.Promise(function(resolve, reject) {
            //reject(new Error("NotImplementedError"));
        //}).nodeify(callback);
    //},
};

module.exports = httpRequest;
