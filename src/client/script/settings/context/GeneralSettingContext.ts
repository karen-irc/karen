/*global jQuery:true */
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

import {NotificationActionCreator} from '../../intent/action/NotificationActionCreator';

import {ConfigRepository} from '../repository/ConfigRepository';
import {GeneralSettingView} from '../view/GeneralSettingView';
import {GeneralSettingViewModel} from '../viewmodel/GeneralSettingViewModel';

import {ViewContext} from '../../../../lib/ViewContext';

export class GeneralSettingContext implements ViewContext {

    private _vm: GeneralSettingViewModel;
    private _view: GeneralSettingView | void;
    private _disposer: Rx.Subscription;

    constructor(config: ConfigRepository, notifyAction: NotificationActionCreator) {
        const initial = config.get();
        this._vm = new GeneralSettingViewModel(initial, notifyAction);

        this._disposer = this._vm.asObservable().subscribe((settings) => {
            config.set(settings);
        });

        const reqNotification: Rx.Subscription = this._vm.notification().showBadge().asObservable()
            .filter((isEnabled: boolean) => isEnabled)
            .subscribe(() => {
                notifyAction.requestPermission();
            });
        this._disposer.add(reqNotification);

        this._view = undefined;
    }

    private _destroy(): void {
        this._disposer.unsubscribe();
        this._view!.destroy();
    }

    onActivate(mountpoint: Element): void {
        this._view = new GeneralSettingView(mountpoint, this._vm);
    }

    onDestroy(_mountpoint: Element): void {
        this._destroy();
    }

    onResume(_mountpoint: Element): void {}
    onSuspend(_mountpoint: Element): void {}
}
