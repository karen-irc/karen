/*eslint-disable consistent-this */

import cheerio from 'cheerio';
import Message from '../../models/Message';
import MessageType from '../../models/MessageType';
import request from 'request';
import ConfigDriver from '../../adapter/ConfigDriver';
import es from 'event-stream';

process.setMaxListeners(0);

function parse(msg, url, res, client) {
    const toggle = msg.toggle = {
        id: msg.id,
        type: '',
        head: '',
        body: '',
        thumb: '',
        link: url
    };

    switch (res.type) {
        /* eslint-disable indent */
        case 'text/html': {
        /* eslint-enable */
            const $ = cheerio.load(res.text);
            toggle.type = 'link';
            toggle.head = $('title').text();
            toggle.body =
                $('meta[name=description]').attr('content') ||
                $('meta[property=\'og:description\']').attr('content') ||
                'No description found.';
            toggle.thumb =
                $('meta[property=\'og:image\']').attr('content') ||
                $('meta[name=\'twitter:image:src\']').attr('content') ||
                '';
            break;
        }

        case 'image/png':
        case 'image/gif':
        case 'image/jpg':
        case 'image/jpeg':
            toggle.type = 'image';
            break;

        default:
            return;
    }

    client.emit('toggle', toggle);
}

function fetch(url, cb) {
    let req = null;
    try {
        req = request.get(url);
    } catch (e) {
        return;
    }

    let length = 0;
    const limit = 1024 * 10;
    req
        .on('response', function(res) {
            if (!(/(text\/html|application\/json)/.test(res.headers['content-type']))) {
                res.req.abort();
            }
        })
        .on('error', function() {})
        // XXX: Avoid ESLint's mis-checking
        /*eslint-disable array-callback-return*/
        .pipe(es.map(function(data, next) {
            length += data.length;
            if (length > limit) {
                req.response.req.abort();
            }
            next(null, data);
        }))
        /*eslint-enable */
        .pipe(es.wait(function(err, data) {
            if (err) {
                return;
            }
            let body = null;
            let type = null;
            try {
                body = JSON.parse(data);
            } catch (e) {
                body = {};
            }

            try {
                type = req.response.headers['content-type'].split(/ *; */).shift();
            } catch (e) {
                type = {};
            }
            const param = {
                text: data,
                body: body,
                type: type
            };
            cb(param);
        }));
}

/**
 *  @this   Client
 *
 *  @param  {?} irc
 *  @param  {Network} network
 *
 *  @return {void}
 */
export default function(irc, network) {
    const client = this;
    irc.on('message', function(data) {
        const config = ConfigDriver.getConfig();
        if (!config.prefetch) {
            return;
        }

        const links = [];
        const split = data.message.split(' ');
        split.forEach(function(w){
            if (w.match(/^(http|https):\/\/localhost/g)) {
                return;
            }
            const match = w.indexOf('http://') === 0 || w.indexOf('https://') === 0;
            if (match) {
                links.push(w);
            }
        });

        if (links.length === 0) {
            return;
        }

        const self = data.to.toLowerCase() === irc.me.toLowerCase();
        const chan = network.channels.find(function(element){
            return element.name === (self ? data.from : data.to);
        });

        if (typeof chan === 'undefined') {
            return;
        }

        const msg = new Message(chan, {
            type: MessageType.TOGGLE,
            time: ''
        });
        chan.messages.push(msg);
        client.emit('msg', {
            chan: chan.id,
            msg: msg
        });

        const link = links[0];
        fetch(link, function(res) {
            parse(msg, link, res, client);
        });
    });
}
