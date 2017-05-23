/**
 * @license MIT License
 *
 * Copyright (c) 2015 Tetsuharu OHZEKI <saneyuki.snyk@gmail.com>
 * Copyright (c) 2015 Yusuke Suzuki <utatane.tea@gmail.com>
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
import expressSession from 'express-session';

const STRICT_TRANSPORT_SECURITY_EXPIRE_TIME = String(60 * 24 * 365 * 1000);
const SESSION_COOKIE_KEY = 'karen.sessionid';

export function applyGenericSecurityHeader(req, res, next) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Strict-Transport-Security', 'max-age=' + STRICT_TRANSPORT_SECURITY_EXPIRE_TIME + ';');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    next();
}

const cspDirective = new Map([
    ['default-src', '\'none\''],
    ['connect-src', '\'self\' ws: wss:'],
    ['font-src', '\'self\' https://fonts.gstatic.com'],

    // XXX: karen tries to expand all image which is embedded in a message.
    ['img-src', '* data:'],

    ['media-src', '\'self\''],
    ['script-src', '\'self\''],

    // FIXME: this 'unsafe-inline' should be removed.
    ['style-src', '\'self\' https://fonts.googleapis.com \'unsafe-inline\''],
]);
const cspDirectiveStr = [...cspDirective.entries()].map(function([key, value]){
    return key + ' ' + value + ';';
}).join(' ');

export function applyHtmlSecurtyHeader(req, res) {
    res.setHeader('Content-Security-Policy', cspDirectiveStr);
    res.setHeader('X-Frame-Options', 'DENY');
}

export function setSessionMiddleware(express, config) {
    express.enable('trust proxy');

    const httpsOptions = config.https || {};
    const sessionOption = {
        cookie: {
            path: '/',
            httpOnly: true,
            secure: !!httpsOptions.enable,
            maxAge: null,
        },
        secret: String(Date.now() * Math.random),
        resave: false,
        name: SESSION_COOKIE_KEY,
        saveUninitialized: config.public,
    };
    express.use(expressSession(sessionOption));
}

export function checkSessionMiddleware(req, res, next) {
    const userInfo = req.session.userInfo;
    if (!!userInfo) {
        next();
    } else {
        res.status(403).send();
    }
}

export function trySignIn(req, res) {
    const { id, password } = req.body;

    const isValidId = typeof id === 'string';
    const isValidPass = typeof password === 'string';
    if (!isValidId || !isValidPass) {
        res.status(400).json({
            ok: false,
        });
        return;
    }

    // TODO: verify password actually

    req.session.userInfo = { // eslint-disable-line no-param-reassign
        userid: id,
    };

    res.status(200).json({
        ok: true,
        userid: id,
    });
}

export function doSignout(req, res) {
    const userInfo = req.session.userInfo;
    if (!userInfo) {
        res.clearCookie(SESSION_COOKIE_KEY);
        res.status(412).send(`You have already signouted.`);
        return;
    }

    req.session.destroy((err) => {
        if (!!err) {
            res.status(500).send(`fail to signout`);
            return;
        }

        res.clearCookie(SESSION_COOKIE_KEY);
        res.status(200).send();
    });
}
