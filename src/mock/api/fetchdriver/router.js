'use strict';

const { HttpStatus, CORS, responseCorsPreflight, } = require('../../http');

class Router {
    constructor(origin) {
        this._origin = origin;
    }

    response(req, res) {
        const method = req.method;
        res.status(HttpStatus.Ok)
            .header(CORS.ALLOW_ORIGIN, req.get(CORS.REQUEST_ORIGIN))
            .json({
                origin: this._origin,
                method,
            });
    }

    responseOptions(req, res) {
        return responseCorsPreflight(req, res);
    }
}

module.exports = Object.freeze({
    Router,
});
