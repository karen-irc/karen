/*global moment:true */
// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import {CookieDriver} from '../../adapter/CookieDriver';
import {SocketIoDriver} from '../../adapter/SocketIoDriver';

declare const moment: any; // tslint:disable-line:no-any

const EVENT_NAME = 'auth';

export class SignInView implements EventListenerObject {

    _element: Element;
    _cookie: CookieDriver;
    _socket: SocketIoDriver;

    constructor(element: Element, cookie: CookieDriver, socket: SocketIoDriver) {
        this._element = element;
        this._cookie = cookie;
        this._socket = socket;

        element.addEventListener('show', this);
        element.addEventListener('submit', this);
    }

    handleEvent(aEvent: Event): void {
        switch (aEvent.type) {
            case 'show':
                this.onShow(aEvent);
                break;
            case 'submit':
                this.onSubmit(aEvent);
                break;
        }
    }

    onShow(aEvent: Event): void {
        const target = aEvent.currentTarget as Element;
        // XXX: By DOM spec (https://dom.spec.whatwg.org/#interface-nodelist),
        // NodeList should be iterable<Node> and this means it has `Symbol.iterator`
        // by Web IDL spec (http://heycam.github.io/webidl/#idl-iterable).
        const list = target.querySelectorAll('input');
        for (let element of Array.from(list)) {
            const input = element as HTMLInputElement;
            // If we find the element which has no value,
            // we stop iteration & focus it.
            if (input.value === '') {
                input.focus();
                break;
            }
        }
    }

    onSubmit(aEvent: Event): void {
        const target = aEvent.target as Element;
        if (target.localName !== 'form') {
            return;
        }
        aEvent.preventDefault();

        // XXX: By DOM spec (https://dom.spec.whatwg.org/#interface-nodelist),
        // NodeList should be iterable<Node> and this means it has `Symbol.iterator`
        // by Web IDL spec (http://heycam.github.io/webidl/#idl-iterable).
        const list = target.querySelectorAll('.btn');
        for (let element of Array.from(list)) {
            (element as Element).setAttribute('disabled', 'true');
        }

        const values: { user: string, [key: string]: any, } = { // tslint:disable-line:no-any
            user: '',
        };
        Array.from(target.querySelectorAll('input')).forEach(function(element: HTMLInputElement){
            if (element.value !== '') {
                values[element.name] = element.value;
            }
        });

        if (!!values.user) {
            this._cookie.set('user', values.user, {
                expires: moment().add(30, 'days').toDate(),
            });
        }

        this._socket.emit(EVENT_NAME, values);
    }
}
