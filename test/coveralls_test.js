'use strict';

var fs = require('fs');
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

exports.coveralls = {
    setUp: function (callback) {
        sinon.stub(coveralls, 'getOptions').callsArgWith(0, null, {});
        sinon.stub(coveralls, 'convertLcovToCoveralls').callsArgWith(2, null, {});
        sinon.stub(coveralls, 'sendToCoveralls').callsArgWith(1, null, {statusCode:200}, '');
        sinon.spy(fs, 'readFile');
        callback();
    },

    tearDown: function (callback) {
        fs.readFile.restore();
        coveralls.sendToCoveralls.restore();
        coveralls.convertLcovToCoveralls.restore();
        coveralls.getOptions.restore();
        callback();
    },

    submits_file_to_coveralls: function (test) {
        var convertStub = coveralls.convertLcovToCoveralls;
        var sendStub = coveralls.sendToCoveralls;

        runGruntTask('coveralls:basic_test', function (result) {
            test.ok(result, 'Should be successful');

            test.ok(coveralls.getOptions.calledOnce);
            test.ok(fs.readFile.calledOnce);
            test.ok(convertStub.calledOnce);
            test.ok(sendStub.calledOnce);
            test.equal(convertStub.getCall(0).args[0], 'lcov.info content', 'Should send lcov data');
            test.done();
        });
    },

    submits_nothing_if_the_file_is_missing: function (test) {
        runGruntTask('coveralls:missing_file_test', function (result) {
            test.ok(!result, 'Should fail');

            test.ok(!coveralls.convertLcovToCoveralls.called);
            test.done();
        });
    },

    submits_multiple_files: function (test) {
        var convertStub = coveralls.convertLcovToCoveralls;
        var sendStub = coveralls.sendToCoveralls;

        runGruntTask('coveralls:multiple_files_test', function (result) {
            test.ok(result, 'Should be successful');

            test.ok(coveralls.getOptions.calledOnce);
            test.ok(fs.readFile.calledTwice);
            test.ok(convertStub.calledTwice);
            test.ok(sendStub.calledTwice);
            test.ok(convertStub.calledWith('lcov.info content'), 'Should send first file data');
            test.ok(convertStub.calledWith('lcov2.info content'), 'Should send second file data');
            test.done();
        });
    },

    submits_present_files_only_if_some_are_missing: function (test) {
        var convertStub = coveralls.convertLcovToCoveralls;
        var sendStub = coveralls.sendToCoveralls;

        runGruntTask('coveralls:some_missing_files_test', function (result) {
            test.ok(result, 'Should be successful');

            test.ok(coveralls.getOptions.calledOnce);
            test.ok(fs.readFile.calledOnce);
            test.ok(convertStub.calledOnce);
            test.ok(sendStub.calledOnce);
            test.equal(convertStub.getCall(0).args[0], 'lcov.info content', 'Should send first file data');
            test.done();
        });
    },

    fails_if_multiple_files_listed_and_all_files_are_missing: function (test) {
        runGruntTask('coveralls:all_missing_files_test', function (result) {
            test.ok(!result, 'Should fail');

            test.ok(!coveralls.convertLcovToCoveralls.called);
            test.done();
        });
    },

    fails_if_file_can_not_be_read: function (test) {
        fs.readFile.restore();
        sinon.stub(fs, 'readFile').callsArgWith(2, 'Error', null);

        runGruntTask('coveralls:basic_test', function (result) {
            test.ok(!result, 'Should fail');

            test.ok(fs.readFile.calledOnce);
            test.ok(!coveralls.convertLcovToCoveralls.called);
            test.done();
        });
    },

    fails_if_coveralls_getOptions_fails: function (test) {
        coveralls.getOptions.restore();
        sinon.stub(coveralls, 'getOptions').callsArgWith(0, 'Error', null);

        runGruntTask('coveralls:basic_test', function (result) {
            test.ok(!result, 'Should fail');

            test.ok(coveralls.getOptions.calledOnce);
            test.ok(!coveralls.convertLcovToCoveralls.called);
            test.done();
        });
    },

    fails_if_coveralls_convertLcovToCoveralls_fails: function (test) {
        coveralls.convertLcovToCoveralls.restore();
        sinon.stub(coveralls, 'convertLcovToCoveralls').callsArgWith(2, 'Error', null);

        runGruntTask('coveralls:basic_test', function (result) {
            test.ok(!result, 'Should fail');

            test.ok(coveralls.convertLcovToCoveralls.calledOnce);
            test.ok(!coveralls.sendToCoveralls.called);
            test.done();
        });
    },

    fails_if_any_files_fail_to_upload: function (test) {
        coveralls.sendToCoveralls.restore();
        sinon.stub(coveralls, 'sendToCoveralls').callsArgWith(1, null, {statusCode:500}, 'Error');

        runGruntTask('coveralls:basic_test', function (result) {
            test.ok(!result, 'Should fail');

            test.ok(coveralls.sendToCoveralls.calledOnce);
            test.done();
        });
    }
};
