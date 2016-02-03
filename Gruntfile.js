"use strict";

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        browserify: {
            test: {
                files: {
                    "test/env/test.generated.js": ["test/*.js"]
                },
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                }
            }
        },

        shell: {
            startTestServer: {
                command: [
                    "./node_modules/.bin/pm2 delete obsidian-http-request 1> /dev/null 2>/dev/null || echo -n",
                    "./node_modules/.bin/pm2 start test/env/test-server.js --name=obsidian-http-request",
                    "sleep 1"
                ].join("&&")
            },
            stopTestServer: {
                command: "./node_modules/.bin/pm2 delete obsidian-http-request"
            }
        },

        jshint: {
            lib: {
                src: ["lib/*.js", "server/*.js", "tests/*.js"],
                options: {
                    jshintrc: true
                }
            }
        },

        mocha_phantomjs: {
            all: {
                options: {
                    urls: ["http://localhost:3042/"]
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks("grunt-shell");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-mocha-phantomjs");

    grunt.registerTask("default", ["test"]);
    grunt.registerTask("server-start", "Start the test server", ["shell:startTestServer"]);
    grunt.registerTask("server-stop", "Stop the test server", ["shell:stopTestServer"]);
    grunt.registerTask("test", "Run all code quality checks and unit tests", [/*"jshint",*/ "browserify:test", "shell:startTestServer", "mocha_phantomjs"]);

};
