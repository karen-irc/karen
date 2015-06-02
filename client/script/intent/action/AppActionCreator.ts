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

import AppActionDispatcher from '../dispatcher/AppActionDispatcher';
import Network from '../../model/Network';

class AppActionCreator {

    _dispatcher: AppActionDispatcher;

    constructor() {
        this._dispatcher = new AppActionDispatcher();
    }

    getDispatcher(): AppActionDispatcher {
        return this._dispatcher;
    }

    reload(): void {
        this._dispatcher.reload.onNext(undefined);
    }

    signout(): void {
        this._dispatcher.signout.onNext(undefined);
        this._dispatcher.reload.onNext(undefined);
    }

    showSignIn(): void {
        this._dispatcher.signout.onNext(undefined);
    }

    renderNetworksInView(data: Array<Network>) {
        this._dispatcher.renderNetworksInView.onNext(data);
    }
}

export default new AppActionCreator();
