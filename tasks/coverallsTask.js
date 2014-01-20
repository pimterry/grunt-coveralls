'use strict';

module.exports = function(grunt) {
    function Runner() {
        var done = this.async();

        if (this.filesSrc.length === 0) {
            grunt.log.error('No src files could be found for grunt-coveralls');
            done(false);
        }

        var successful = true;
        var remainingSubmissions = this.filesSrc.length;

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

        for (var ii = 0; ii < this.filesSrc.length; ii++) {
            submitToCoveralls(this.filesSrc[ii], receiveResult);
        }
    }

    function submitToCoveralls(fileName, callback) {
        grunt.verbose.writeln("Submitting file to coveralls.io: " + fileName);

        var coveralls = require('coveralls');
        var fs = require('fs');

        try {
            coveralls.handleInput(fs.readFileSync(fileName, 'utf8'));
            grunt.verbose.ok("Successfully submitted " + fileName + " to coveralls");
            callback(true);
        } catch (e) {
            grunt.verbose.error("Failed to submit " + fileName + " to coveralls (" + e + ")");
            callback(false);
        }
    }

    grunt.registerMultiTask('coveralls', 'Grunt task to load coverage results and submit them to Coveralls.io', Runner);
};