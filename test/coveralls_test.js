'use strict';

var coveralls = require('coveralls');
var grunt = require('grunt');
var sinon = require('sinon');

function runGruntTask(taskName, callback) {
    var task = grunt.task._taskPlusArgs(taskName);
    task.task.fn.apply({
        nameArgs: task.nameArgs,
        name: task.task.name,
        args: task.args,
        flags: task.flags,
        async: function() { return callback; }
    }, task.args);
}

var coveralls_handleInput = coveralls.handleInput;

exports.coveralls = {
    setUp: function (callback) {
        coveralls.handleInput = sinon.stub();
        callback();
    },

    tearDown: function (callback) {
        coveralls.handleInput = coveralls_handleInput;
        callback();
    },

    submits_file_to_coveralls: function (test) {
        var handleStub = coveralls.handleInput;

        runGruntTask('coveralls:basic_test', function (result) {
            test.ok(result, 'Should be successful');

            test.ok(handleStub.calledOnce);
            test.equal(handleStub.firstCall.args[0], 'lcov.info content', 'Should send lcov data');
            test.done();
        });
    },

    submits_nothing_if_the_file_is_missing: function (test) {
        runGruntTask('coveralls:missing_file_test', function (result) {
            test.ok(!result, 'Should fail');

            test.ok(!coveralls.handleInput.called);
            test.done();
        });
    },

    submits_multiple_files: function (test) {
        var handleStub = coveralls.handleInput;

        runGruntTask('coveralls:multiple_files_test', function (result) {
            test.ok(result, 'Should be successful');

            test.ok(handleStub.calledTwice);
            test.equal(handleStub.firstCall.args[0], 'lcov.info content', 'Should send first file data');
            test.equal(handleStub.secondCall.args[0], 'lcov2.info content', 'Should send second file data');
            test.done();
        });
    },

    submits_present_files_only_if_some_are_missing: function (test) {
        var handleStub = coveralls.handleInput;

        runGruntTask('coveralls:some_missing_files_test', function (result) {
            test.ok(result, 'Should be successful');

            test.ok(handleStub.calledOnce);
            test.equal(handleStub.firstCall.args[0], 'lcov.info content', 'Should send first file data');
            test.done();
        });
    },

    fails_if_multiple_files_listed_and_all_files_are_missing: function (test) {
        runGruntTask('coveralls:all_missing_files_test', function (result) {
            test.ok(!result, 'Should fail');

            test.ok(!coveralls.handleInput.called);
            test.done();
        });
    },

    fails_if_any_files_fail_to_upload: function (test) {
        var handleStub = coveralls.handleInput;
        handleStub.throws("Error");

        runGruntTask('coveralls:basic_test', function (result) {
            test.ok(!result, 'Should fail');
            test.done();
        });
    }
};
