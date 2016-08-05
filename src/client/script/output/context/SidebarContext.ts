// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Rx from 'rxjs';

import {MessageActionCreator} from '../../intent/action/MessageActionCreator';
import {UIActionCreator} from '../../intent/action/UIActionCreator';

import {Sidebar} from '../view/Sidebar';
import {SidebarStore, SidebarViewState} from '../viewmodel/SidebarStore';

import {DomainState} from '../../domain/DomainState';

import {ViewContext} from '../../../../lib/ViewContext';

export class SidebarContext implements ViewContext {

    private _viewmodel: SidebarStore;
    private _viewDisposer: Rx.Subscription | void;

    constructor(domain: DomainState, msgAction: MessageActionCreator, uiAction: UIActionCreator) {
        this._viewmodel = new SidebarStore(domain, msgAction, uiAction);
        this._viewDisposer = undefined;
    }

    private _destroy(): void {
        this._viewDisposer.unsubscribe();
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
