/**
 *  Use this file to prepare to the test environment.
 *  Load some polyfill modules which effect global to run on nodejs.
 *  e.g. jsdom.
 */
/* eslint-env browser */

'use strict';

const {JSDOM} = require('jsdom');
const {origin} = require('./test_config');

const htmlStr = `
<!DOCTYPE html>
<html>
    <head>
    </head>
    <body></body>
</html>`;

// XXX:
// Of course, we would not like to extend the global object
// to create the perfect mock of web browser.
// However, we also think it would be danger to use auto binding by `Object.assign()` or other similar ways.
// It might override Node.js's builtin variables.
// So we add properties by hand.
const { window } = new JSDOM(htmlStr, {
    url: String(origin.FIRST),
});
global.window = window;
global.document = window.document;
global.self = global.window; // `window.self`
global.FormData = global.window.FormData;
global.XMLHttpRequest = global.window.XMLHttpRequest;
global.URLSearchParams = global.window.URLSearchParams;

// for FetchDriver
require('whatwg-fetch');
global.Request = self.Request;
global.Response = self.Response;
