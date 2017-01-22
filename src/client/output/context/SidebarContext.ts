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
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Rx from 'rxjs';

import {MessageActionCreator} from '../../intent/action/MessageActionCreator';
import {UIActionCreator} from '../../intent/action/UIActionCreator';

import {Sidebar} from '../view/Sidebar';
import {SidebarStore, SidebarViewState} from '../viewmodel/SidebarStore';

import {DomainState} from '../../domain/DomainState';

import {ViewContext} from '../../../lib/ViewContext';

export class SidebarContext implements ViewContext {

    private _viewmodel: SidebarStore;
    private _viewDisposer: Rx.Subscription | null;

    constructor(domain: DomainState, msgAction: MessageActionCreator, uiAction: UIActionCreator) {
        this._viewmodel = new SidebarStore(domain, msgAction, uiAction);
        this._viewDisposer = null;
    }

    private _destroy(): void {
        this._viewDisposer!.unsubscribe();
        this._viewmodel.dispose();
    }

    onActivate(mountpoint: Element): void {
        this._viewDisposer = this._mount(mountpoint);
    }

    onDestroy(_mountpoint: Element): void {
        this._destroy();
    }

    onResume(_mountpoint: Element): void {}

    onSuspend(_mountpoint: Element): void {}

    private _mount(mountpoint: Element): Rx.Subscription {
        const observer: Rx.Subscriber<SidebarViewState> = Rx.Subscriber.create((model: SidebarViewState) => {
            const view = React.createElement(Sidebar, {
                model,
            });
            ReactDOM.render(view, mountpoint);
        }, ()=> {}, () => {
            ReactDOM.unmountComponentAtNode(mountpoint);
        });
        return this._viewmodel.subscribe(observer);
    }
}
