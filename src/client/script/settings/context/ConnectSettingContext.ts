/*global jQuery:true */
// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Rx from 'rxjs';

import {ConnectSettingWindow} from '../view/ConnectSettingWindow';

import {MessageGateway} from '../../adapter/MessageGateway';
import {ConnectionActionCreator} from '../intent/ConnectionSettingIntent';
import {ConnectionStore} from '../viewmodel/ConnectionStore';
import {ConnectionValue} from '../domain/value/ConnectionSettings';

import {ViewContext} from '../../../../lib/ViewContext';

export class ConnectSettingContext implements ViewContext {

    private _action: ConnectionActionCreator;
    private _store: ConnectionStore;
    private _viewDisposer: Rx.Subscription | undefined;

    constructor(gateway: MessageGateway) {
        if (!gateway) {
            throw new Error();
        }

        this._action = new ConnectionActionCreator();
        this._store = new ConnectionStore(this._action.dispatcher(), gateway);
        this._viewDisposer = undefined;
    }

    private _destroy(): void {
        this._viewDisposer!.unsubscribe();
        this._store.dispose();
        this._action.dispose();
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
        const observer: Rx.Subscriber<ConnectionValue> = Rx.Subscriber.create((data: ConnectionValue) => {
            const view = React.createElement(ConnectSettingWindow, {
                viewmodel: this._store.viewmodel(),
                action: this._action,
                data: data,
            });
            ReactDOM.render(view, mountpoint);
        }, ()=> {}, () => {
            ReactDOM.unmountComponentAtNode(mountpoint);
        });
        return this._store.subscribe(observer);
    }
}
