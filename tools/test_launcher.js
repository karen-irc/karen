/**
 * MIT License
 *
 * Copyright (c) 2016 Tetsuharu OHZEKI <saneyuki.snyk@gmail.com>
 * Copyright (c) 2016 Yusuke Suzuki <utatane.tea@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
/// <reference path='../typings/index.d.ts'/>
'use strict';

const { EventEmitter } = require('events');
const os = require('os');
const path = require('path');

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
    const suffix = (os.platform() === 'win32') ? '.cmd' : '';
    const bin = path.resolve(repoRootDir, 'node_modules', '.bin', name + suffix);
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
    const manifest = path.resolve(repoRootDir, '__test_cache', 'client', 'script', 'test_manifest.js');
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
