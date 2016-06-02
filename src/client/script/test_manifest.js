import {jsdom} from 'jsdom';

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
global.document = jsdom(htmlStr, {
    url: 'https://localhost:8080/',
});
global.window = global.document.defaultView;
global.self = global.window; // `window.self`

require('./lib/test/test_ExIterable');
