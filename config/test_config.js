// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
'use strict';

// http://tools.ietf.org/html/rfc6454
class Origin {
    /**
     *  @param  {string}    scheme
     *  @param  {string}    host
     *  @param  {number}    port
     */
    constructor(scheme, host, port) {
        this.scheme = scheme;
        this.host = host;
        this.port = port;

        Object.freeze(this);
    }

    /**
     *  see: http://tools.ietf.org/html/rfc6454#section-6.1
     *  @return {string}
     */
    toString() {
        return this.scheme + '://' + this.host + ':' + this.port;
    }
}

module.exports = Object.freeze({
    origin: Object.freeze({
        FIRST: new Origin('http', 'localhost', 9876),
        SECOND: new Origin('http', 'localhost', 9001),
    }),
});
