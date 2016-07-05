// <reference path='../../typings/index.d.ts'/>
'use strict';

const express = require('express');

const MOCK_PORT = process.env.MOCK_PORT;

const app = express();
app.listen(MOCK_PORT);

console.log(`
mock server
port: ${String(MOCK_PORT)}
`);
