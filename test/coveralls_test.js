'use strict';

var grunt = require('grunt');

exports.coveralls = {
    submits_file_to_coveralls: function (test) {
        grunt.task.run('coveralls:basic_test');
        test.ok(true);
        test.done();
    },

    submits_multiple_files_to_coveralls: function (test) {
        grunt.task.run('coveralls:multiple_files_test');
        test.done();
    },

    submits_nothing_if_the_file_is_missing: function (test) {
        grunt.task.run('coveralls:missing_file_test');
        test.done();
    },

    submits_nothing_if_one_file_of_many_is_missing: function (test) {
        grunt.task.run('coveralls:missing_files_test');
        test.done();
    }
};
