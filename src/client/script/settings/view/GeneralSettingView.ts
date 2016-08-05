// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as Rx from 'rxjs';

import {ReactiveProperty} from '../../../../lib/ReactiveProperty';
import {GeneralSettingViewModel} from '../viewmodel/GeneralSettingViewModel';

export class GeneralSettingView implements EventListenerObject {

    private _viewmodel: GeneralSettingViewModel;
    private _element: Element | void;
    private _disposer: Rx.Subscription;
    private _propMap: Map<string, ReactiveProperty<boolean>>;

    constructor(element: Element, viewmodel: GeneralSettingViewModel) {
        this._viewmodel = viewmodel;
        this._element = element;

        const disposer = new Rx.Subscription();
        this._disposer = disposer;

        const playElement = element.querySelector('#play');
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
        this._element.removeEventListener('change', this);
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
        const input = this._element.querySelector('input[name=' + name + ']') as HTMLInputElement;
        if (!input) {
            return;
        }

        input.checked = value;
    }
}


function toObservable<T>(src: ReactiveProperty<T>): Rx.Observable<T> {
    return src.distinctUntilChanged();
}
