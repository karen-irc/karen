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

import { ReactiveProperty } from '../../../lib/ReactiveProperty';
import { GeneralSettingViewModel } from '../viewmodel/GeneralSettingViewModel';

export class GeneralSettingView implements EventListenerObject {

    private _element: Element | void;
    private _disposer: Rx.Subscription;
    private _propMap: Map<string, ReactiveProperty<boolean>>;

    constructor(element: Element, viewmodel: GeneralSettingViewModel) {
        this._element = element;

        const disposer = new Rx.Subscription();
        this._disposer = disposer;

        const playElement = element.querySelector('#play');
        if (playElement === null) {
            throw new TypeError();
        }

        disposer.add(Rx.Observable.fromEvent<Event>(playElement, 'click').subscribe(() => {
            viewmodel.playSound();
        }));

        this._propMap = new Map([
            ['thumbnails', viewmodel.link().autoExpandThumbnail()],
            ['links', viewmodel.link().autoExpandLinks()],
            ['join', viewmodel.message().showJoin()],
            ['motd', viewmodel.message().showMotd()],
            ['part', viewmodel.message().showPart()],
            ['nick', viewmodel.message().showNickChange()],
            ['mode', viewmodel.message().showMode()],
            ['quit', viewmodel.message().showQuit()],
            ['badge', viewmodel.notification().showBadge()],
            ['notification', viewmodel.notification().showNotification()],
        ]);

        this._propMap.forEach((value: ReactiveProperty<boolean>, name: string) => {
            const domUpdater = toObservable(value).subscribe((isEnabled: boolean) => {
                this._updateState(name, isEnabled);
            });
            disposer.add(domUpdater);
        });

        element.addEventListener('change', this);
    }

    destroy(): void {
        this._disposer.unsubscribe();
        // tslint:disable-next-line:no-non-null-assertion
        this._element!.removeEventListener('change', this);
        this._element = undefined;
    }

    handleEvent(aEvent: Event): void {
        switch (aEvent.type) {
            case 'change':
                this.onChange(aEvent);
                break;
        }
    }

    onChange(aEvent: Event): void {
        const target = aEvent.target as Element;
        if (target.localName !== 'input') {
            return;
        }

        const name = target.getAttribute('name');
        const value: boolean = (target as HTMLInputElement).checked;
        if (name === null) {
            throw new Error('unreachable');
        }

        const prop: ReactiveProperty<boolean> | void = this._propMap.get(name);
        if (prop === undefined) {
            throw new Error('unreachable');
        }
        prop.setValue(value);
    }

    private _updateState(name: string, value: boolean): void {
        // tslint:disable-next-line:no-non-null-assertion
        const input = this._element!.querySelector('input[name=' + name + ']') as HTMLInputElement;
        if (!input) {
            return;
        }

        input.checked = value;
    }
}


function toObservable<T>(src: ReactiveProperty<T>): Rx.Observable<T> {
    return src.distinctUntilChanged();
}
