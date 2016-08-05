// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as Rx from 'rxjs';

import {AppActionCreator} from '../../intent/action/AppActionCreator';
import {UIActionCreator} from '../../intent/action/UIActionCreator';

import {DomainState} from '../../domain/DomainState';

export class SidebarFooterView implements EventListenerObject {

    _appAction: AppActionCreator;
    _uiAction: UIActionCreator;

    _element: Element;
    _signinElement: HTMLElement;
    _signoutElement: HTMLElement;
    _connectElement: HTMLElement;
    _settingElement: HTMLElement;

    _lastSelectedElement: HTMLElement | void;

    _disposableSignIn: Rx.Subscription;
    _disposableSignout: Rx.Subscription;
    _disposableShowConnect: Rx.Subscription;
    _disposableShowSetting: Rx.Subscription;
    _disposableSelectChannel: Rx.Subscription;

    constructor(domain: DomainState, element: Element, appAction: AppActionCreator, uiAction: UIActionCreator) {
        this._appAction = appAction;
        this._uiAction = uiAction;
        this._element = element;
        this._signinElement = element.querySelector('.sign-in') as HTMLElement;
        this._signoutElement = element.querySelector('.sign-out') as HTMLElement;
        this._connectElement = element.querySelector('.connect') as HTMLElement;
        this._settingElement = element.querySelector('.settings') as HTMLElement;

        this._lastSelectedElement = undefined;

        this._disposableSignIn = uiAction.dispatcher().showSignIn.subscribe(() => {
            this.selectElement(this._lastSelectedElement!, this._signinElement);
        });

        this._disposableSignout = this._appAction.dispatcher().signout.subscribe(() => {
            this.selectElement(this._lastSelectedElement!, this._signoutElement);
        });

        this._disposableShowConnect = domain.getSelectedSetting().filter(function(id){
            return (id === 'connect');
        }).subscribe(() => {
            this.selectElement(this._lastSelectedElement!, this._connectElement);
        });

        this._disposableShowSetting = domain.getSelectedSetting().filter(function(id){
            return (id === 'settings');
        }).subscribe(() => {
            this.selectElement(this._lastSelectedElement!, this._settingElement);
        });

        this._disposableSelectChannel = domain.getSelectedChannel().subscribe(() => {
            this.selectElement(this._lastSelectedElement!, undefined);
        });

        element.addEventListener('click', this);
    }

    destroy(): void {
        this._element.removeEventListener('click', this);

        this._disposableSignIn.unsubscribe();
        this._disposableSignout.unsubscribe();
        this._disposableShowConnect.unsubscribe();
        this._disposableShowSetting.unsubscribe();
        this._disposableSelectChannel.unsubscribe();
    }

    handleEvent(aEvent: Event): void {
        switch (aEvent.type) {
            case 'click':
                this.onClick(aEvent);
                break;
        }
    }

    onClick(aEvent: Event): void {
        const target = aEvent.target as Element;
        if (target.localName !== 'button') {
            return;
        }

        if (target === this._connectElement) {
            this._uiAction.showConnectSetting();
        }
        else if (target === this._settingElement) {
            this._uiAction.showGeneralSetting();
        }
        else if (target === this._signoutElement) {
            this._appAction.signout();
        }
        else if (target === this._signinElement) {
            this._uiAction.showSignIn();
        }
    }

    selectElement(last: HTMLElement, current: HTMLElement | void): void {
        if (last !== undefined) {
            this.deactivate(last);
        }

        if (current !== undefined) {
            this.activate(current);
        }

        this._lastSelectedElement = current;
    }

    deactivate(element: HTMLElement): void {
        element.classList.remove('active');
    }

    activate(element: HTMLElement): void {
        element.classList.add('active');
    }
}
