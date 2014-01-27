'use strict';

var coveralls = require('coveralls');
var fs = require('fs');
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

exports.coveralls = {
    setUp: function (callback) {
        sinon.stub(coveralls, 'handleInput').callsArgWith(1, null);
        sinon.spy(fs, 'readFile');
        callback();
    },

    tearDown: function (callback) {
        fs.readFile.restore();
        coveralls.handleInput.restore();
        callback();
    },

    submits_file_to_coveralls: function (test) {
        var handleStub = coveralls.handleInput;

        runGruntTask('coveralls:basic_test', function (result) {
            test.ok(result, 'Should be successful');

            test.ok(handleStub.calledOnce);
            test.equal(handleStub.getCall(0).args[0], 'lcov.info content', 'Should send lcov data');
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
            test.equal(handleStub.getCall(0).args[0], 'lcov.info content', 'Should send first file data');
            test.equal(handleStub.getCall(1).args[0], 'lcov2.info content', 'Should send second file data');
            test.done();
        });
    },

    submits_present_files_only_if_some_are_missing: function (test) {
        var handleStub = coveralls.handleInput;

        runGruntTask('coveralls:some_missing_files_test', function (result) {
            test.ok(result, 'Should be successful');

            test.ok(handleStub.calledOnce);
            test.equal(handleStub.getCall(0).args[0], 'lcov.info content', 'Should send first file data');
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

    fails_if_file_is_not_readable: function (test) {
        fs.readFile.restore();
        var readStub = sinon.stub(fs, 'readFile').callsArgWith(2, 'Error');

        runGruntTask('coveralls:basic_test', function (result) {
            test.ok(!result, 'Should fail');

            test.ok(readStub.calledOnce);
            test.done();
        });
    },

    fails_if_any_files_fail_to_upload: function (test) {
        coveralls.handleInput.restore();
        var handleStub = sinon.stub(coveralls, 'handleInput').callsArgWith(1, 'Error');

        runGruntTask('coveralls:basic_test', function (result) {
            test.ok(!result, 'Should fail');

            test.ok(handleStub.calledOnce);
            test.done();
        });
    }
};
