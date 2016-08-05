// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import expressSession from 'express-session';

const STRICT_TRANSPORT_SECURITY_EXPIRE_TIME = String(60 * 24 * 365 * 1000);

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
    ['img-src', '*'],

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
        name: 'karen.sessionid',
        saveUninitialized: config.public,
    };
    express.use(expressSession(sessionOption));
}
