'use strict';

var grunt = require('grunt');
var sinon = require('sinon');

var child_process = require('child_process');

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

function stubChildProcess() {
    return {
        stdin: {
            end: sinon.stub()
        },
        on: sinon.stub()
    };
}

var child_process_spawn = child_process.spawn;

exports.coveralls = {
    setUp: function (callback) {
        child_process.spawn = sinon.stub();
        callback();
    },

    tearDown: function (callback) {
        child_process.spawn = child_process_spawn;
        callback();
    },

    submits_file_to_coveralls: function (test) {
        var procStub = stubChildProcess();
        var inputStub = procStub.stdin.end;
        child_process.spawn.returns(procStub);

        runGruntTask('coveralls:basic_test', function (result) {
            test.ok(result, 'Should be successful');

            test.ok(inputStub.calledOnce);
            test.ok(inputStub.calledWith('lcov.info content'), 'Should send lcov data');
            test.done();
        });

        procStub.on.withArgs('exit').yield(0);
    },

    submits_nothing_if_the_file_is_missing: function (test) {
        child_process.spawn = sinon.stub();

        runGruntTask('coveralls:missing_file_test', function (result) {

            test.ok(!result, 'Should fail');

            test.ok(!child_process.spawn.called);
            test.done();
        });
    }
};
