// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
/// <reference path='../typings/index.d.ts'/>
'use strict';

const { EventEmitter } = require('events');
const path = require('path');
const { argv } = require('yargs');

const { getSuffixedCommandName } = require('./platform');
const { spawnCancelableChild, assertReturnCode } = require('./spawn');
const testConfig = require('../config/test_config');

const repoRootDir = path.resolve(__dirname, '..');

const EVENT_GRACEFUL_KILL = 'kill-all';
const master = new EventEmitter();

function spawn(name, args, option) {
    const { process: proc, canceller, } = spawnCancelableChild(name, args, option);

    const killSelf = function() {
        canceller();
    };
    master.addListener(EVENT_GRACEFUL_KILL, killSelf);

    const onExit = function () {
        master.removeListener(EVENT_GRACEFUL_KILL, killSelf);
        master.emit(EVENT_GRACEFUL_KILL);
    };

    return proc
        .then((signal) => {
            onExit();
            return signal;
        }).then(assertReturnCode);
}

function runNodeModCommand(name, args) {
    const cmd = getSuffixedCommandName(name);
    const bin = path.resolve(repoRootDir, 'node_modules', '.bin', cmd);
    const proc = spawn(bin, args, {
        stdio: 'inherit',
    });
    return proc;
}
function runMockServer(origin) {
    const mock = spawn('node', [path.resolve(repoRootDir, 'src', 'mock', 'server.js')], {
        stdio: 'inherit',
        env: Object.assign(process.env, {
            MOCK_ORIGIN: String(origin),
            MOCK_PORT: origin.port,
        }),
    });
    console.log('you can access mock server with `localhost:' + String(origin.port) + '`');
    return mock;
}
function runMocha(args) {
    return runNodeModCommand('mocha', args);
}

function launchForNode() {
    const file = argv.manifest;
    const manifest = path.resolve(repoRootDir, '__test_cache', file);
    const firstMock = runMockServer(testConfig.origin.FIRST);
    const secondMock = runMockServer(testConfig.origin.SECOND);

    const mocha = runMocha([manifest]);

    return [mocha, firstMock, secondMock];
}

(function main(){
    process.stdin.resume();
    process.on('SIGINT', function() {
        master.emit(EVENT_GRACEFUL_KILL);
    });

    const children = launchForNode();
    Promise.all(children).then(function(){
        process.exit();
    }, (e) => {
        process.exit(e);
    });
})();
