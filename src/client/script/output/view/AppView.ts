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

import * as Rx from 'rxjs';

import {ReactiveProperty} from '../../../../lib/ReactiveProperty';

import {UIActionCreator} from '../../intent/action/UIActionCreator';

class AppViewModel {

    readonly isOpenedLeftPane: ReactiveProperty<boolean>;
    readonly isOpenedRightPane: ReactiveProperty<boolean>;

    constructor() {
        this.isOpenedLeftPane = new ReactiveProperty(false);
        this.isOpenedRightPane = new ReactiveProperty(false);
    }

    destroy(): void {
        this.isOpenedLeftPane.unsubscribe();
        this.isOpenedRightPane.unsubscribe();
    }
}

export class AppView {

    private _element: Element | void;
    private _vm: AppViewModel;
    private _disposer: Rx.Subscription;
    private _uiAction: UIActionCreator;

    constructor(element: Element, uiAction: UIActionCreator) {
        this._element = element;
        this._vm = new AppViewModel();

        const disposer = new Rx.Subscription();
        this._disposer = disposer;
        this._uiAction = uiAction;

        disposer.add(this._toggleLeftPane());
        disposer.add(this._toggleRightPane());
        disposer.add(this._handleClickEvent());

        this._vm.isOpenedLeftPane.setValue(element.classList.contains('lt'));
        this._vm.isOpenedRightPane.setValue(element.classList.contains('rt'));
    }

    destroy(): void {
        this._element = undefined;
        this._vm.destroy();
        this._disposer.unsubscribe();
    }

    private _toggleLeftPane(): Rx.Subscription {
        return this._vm.isOpenedLeftPane.asObservable()
            .merge(this._uiAction.dispatcher().toggleLeftPane)
            .distinctUntilChanged()
            .subscribe((shouldOpen: boolean) => {
                const className = 'lt';
                const classList = this._element.classList;
                if (shouldOpen) {
                    classList.add(className);
                }
                else {
                    classList.remove(className);
                }
            });
    }

    private _toggleRightPane(): Rx.Subscription {
        return this._vm.isOpenedRightPane.asObservable().subscribe((shouldOpen: boolean) => {
            const className = 'rt';
            const classList = this._element.classList;
            if (shouldOpen) {
                classList.add(className);
            }
            else {
                classList.remove(className);
            }
        });
    }

    private _handleClickEvent(): Rx.Subscription {
        return Rx.Observable.fromEvent<Element>(this._element!, 'click', (event: UIEvent) => event.target as Element)
            .filter((target: Element): boolean => (target.localName === 'button'))
            .subscribe((target: Element) => {
                if (target.classList.contains('lt')) {
                    const shouldOpen: boolean = !this._vm.isOpenedLeftPane.value();
                    this._vm.isOpenedLeftPane.setValue(shouldOpen);
                    this._uiAction.toggleLeftPane(shouldOpen);
                }
                else if (target.classList.contains('rt')) {
                    const shouldOpen: boolean = !this._vm.isOpenedRightPane.value();
                    this._vm.isOpenedRightPane.setValue(shouldOpen);
                }
            });
    }
}
