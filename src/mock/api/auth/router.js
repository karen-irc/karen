'use strict';

const { HttpStatus, MimeType, } = require('../../http');

class Router {
    constructor(origin) {
        this._origin = origin;
    }

    responseSignin(req, res) {
        let status = HttpStatus.BadRequest;

        const isValidContentType = req.get('Content-Type') === MimeType.JSON;
        const hasId = typeof req.body.id === 'string';
        const hasPass = typeof req.body.password === 'string';
        if (isValidContentType && hasId && hasPass) {
            status = HttpStatus.Ok;
        }

        res.status(status)
            .send();
    }

    responseSignout(req, res) {
        let status = HttpStatus.BadRequest;
        if (req.get('Content-Type') === MimeType.JSON) {
            status = HttpStatus.Ok;
        }

        res.status(status)
            .send();
    }
}

module.exports = Object.freeze({
    Router,
});
