/*
 * grunt-coveralls
 * https://github.com/pimterry/grunt-coveralls
 *
 * Copyright (c) 2013 Tim Perry
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/*.js',
                '<%= nodeunit.tests %>'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        // Configuration to be run (and then tested).
        coveralls: {
            basic_test: {
                lcov: 'test/fixtures/lcov.info'
            },
            multiple_files_test: {
                lcov: ['test/fixtures/lcov.info', 'test/fixtures/lcov2.info']
            },
            missing_file_test: {
                lcov: 'test/fixtures/nonexistent_lcov.info'
            },
            missing_files_test: {
                lcov: ['lcov.info', 'test/fixtures/nonexistent_lcov.info']
            },

            test_test_coverage: {

            }
        },

        // Unit tests.
        nodeunit: {
            tests: ['test/*_test.js']
        },

        watch: {
            gruntfile: {
                files: 'Gruntfile.js',
                tasks: ['jshint']
            },
            lib: {
                files: 'tasks/*.js',
                tasks: ['test']
            },
            test: {
                files: 'test/*js',
                tasks: ['test']
            }
        }

    });

    grunt.loadTasks('tasks');

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['test']);
    grunt.registerTask('test', ['jshint', 'nodeunit']);

};
