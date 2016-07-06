/// <reference path='../../typings/index.d.ts'/>
'use strict';

const express = require('express');

const routeFetchDriver = require('./api/fetchdriver/router');

const MOCK_ORIGIN = process.env.MOCK_ORIGIN;
const MOCK_PORT = process.env.MOCK_PORT;

const app = express();

{
    const BASE = '/api/fetchdriver';
    const router = new routeFetchDriver.Router(MOCK_ORIGIN);

    app.get(BASE + '/get', (req, res) => router.response(req, res));
    app.options(BASE + '/get', (req, res) => router.responseOptions(req, res));

    app.post(BASE + '/post', (req, res) => router.response(req, res));
    app.options(BASE + '/post', (req, res) => router.responseOptions(req, res));
}

app.listen(MOCK_PORT);

console.log(`
mock server
port: ${String(MOCK_PORT)}
`);
