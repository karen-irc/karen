/*global jQuery:true */
// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
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
