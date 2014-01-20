'use strict';

var coveralls = require('coveralls');
var fs = require('fs');

module.exports = function(grunt) {
    function Runner() {
        var done = this.async();

        if (this.filesSrc.length === 0) {
            grunt.log.error('No src files could be found for grunt-coveralls');
            done(false);
        }

        var successful = true;
        var filesSrc = this.filesSrc;
        var remainingSubmissions = filesSrc.length;

        function receiveResult(result) {
            successful = successful && result;
            remainingSubmissions--;

            if (remainingSubmissions === 0) {
                if (successful) {
                    grunt.log.ok("Successfully submitted coverage results to coveralls");
                    done(true);
                } else {
                    grunt.log.error("Failed to submit coverage results to coveralls");
                    done(false);
                }
            }
        }

        coveralls.getOptions(function(err, options) {
            if (err) {
                grunt.verbose.error("Failed to get options of coveralls");
                return done(false);
            }
            for (var ii = 0; ii < filesSrc.length; ii++) {
                submitToCoveralls(options, filesSrc[ii], receiveResult);
            }
        });
    }

    function submitToCoveralls(options, fileName, callback) {
        fs.readFile(fileName, {encoding:"utf8"}, function(err, fileContent) {
            if (err) {
                grunt.verbose.error("Failed to read file: " + fileName);
                return callback(false);
            }

            grunt.verbose.writeln("Converting file for coveralls.io: " + fileName);
            coveralls.convertLcovToCoveralls(fileContent, options, function(err, postData) {
                if (err) {
                    grunt.verbose.error("Failed to convert file for coveralls.io: " + fileName);
                    return callback(false);
                }

                grunt.verbose.writeln("Submitting file to coveralls.io: " + fileName);
                coveralls.sendToCoveralls(postData, function(err, response, body) {
                    if (err || response.statusCode !== 200) {
                        grunt.verbose.error("Failed to submit file to coveralls.io: " + fileName + " (" + response.statusCode + " " + body + ")");
                        return callback(false);
                    }
                    return callback(true);
                });
            });
        });
    }

    grunt.registerMultiTask('coveralls', 'Grunt task to load coverage results and submit them to Coveralls.io', Runner);
};