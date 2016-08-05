// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';

import Package from '../adapter/Package';
import {applyHtmlSecurtyHeader} from '../app/security';

import { KarenAppIndex as IndexTemplate } from '../view/classic/Index';
import {RizeIndex} from '../view/rize/RizeIndex';

const isEnableRize = process.env.ENABLE_RIZE === '1';

export function routeIndex(config, req, res, next) {
    if (req.url.split('?')[0] !== '/') {
        next();
        return;
    }

    let data = Object.assign({}, Package.getPackage());
    data = Object.assign(data, config);
    res.setHeader('Content-Type', 'text/html');
    applyHtmlSecurtyHeader(req, res);
    res.writeHead(200);

    const view = isEnableRize ?
        React.createElement(RizeIndex, null) :
        React.createElement(IndexTemplate, {
            data: data,
        });
    const html = '<!DOCTYPE html>' + ReactDOMServer.renderToStaticMarkup(view);
    res.end(html);
}
