/*eslint quotes: [2, "single"], indent: [2, 4]*/
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
'use strict';

const assign = require('object-assign');
const moment = require('moment');
const MessageType = require('./MessageType');

let id = 0;

function Message(attr) {
    let data = assign({
        type: MessageType.MESSAGE,
        id: id + 1,
        text: '',
        time: moment().utc().format('HH:mm:ss'),
        from: '',
        mode: '',
        self: false
    }, attr);

    /** @type   {MessageType}  */
    this.type = data.type;

    /** @type   {number}    */
    this.id = data.id;

    /** @type   {string}    */
    this.text = data.text;

    /** @type   {string}    */
    this.time = data.time;

    /** @type   {string}    */
    this.from = data.from;

    /** @type   {string}    */
    this.mode = data.mode;

    /** @type   {boolean}   */
    this.self = data.self;
}

module.exports = Message;
