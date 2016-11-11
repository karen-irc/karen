'use strict';

const HttpStatus = Object.freeze({
    Ok: 200,

    BadRequest: 400,
});

const MimeType = Object.freeze({
    JSON: 'application/json',
});

const CORS = Object.freeze({
    ALLOW_ORIGIN: 'Access-Control-Allow-Origin',
    REQUEST_ORIGIN: 'Origin',

    ALLOW_METHOD: 'Access-Control-Allow-Methods',
    REQUEST_METHOD: 'Access-Control-Request-Method',

    ALLOW_HEADERS: 'Access-Control-Allow-Headers',
    REQUEST_HEADERS: 'Access-Control-Request-Headers',
});

function responseCorsPreflight(req, res) {
    const headers = {};
    headers[CORS.ALLOW_ORIGIN] = req.get(CORS.REQUEST_ORIGIN);
    headers[CORS.ALLOW_METHOD] = req.get(CORS.REQUEST_METHOD);
    headers[CORS.ALLOW_HEADERS] = req.get(CORS.ALLOW_METHOD);
    res.status(HttpStatus.Ok).set(headers).send();
}

module.exports = Object.freeze({
    HttpStatus,
    MimeType,
    CORS,
    responseCorsPreflight,
});
