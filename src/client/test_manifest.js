import {jsdom} from 'jsdom';
import {origin} from '../../config/test_config';

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
    url: String(origin.FIRST),
});
global.window = global.document.defaultView;
global.self = global.window; // `window.self`
global.FormData = global.window.FormData;
global.XMLHttpRequest = global.window.XMLHttpRequest;

// for FetchDriver
require('whatwg-fetch');
global.Request = self.Request;
global.Response = self.Response;

require('./domain/test/test_MessageNode');
