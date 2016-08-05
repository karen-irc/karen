// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import {Option, Some, None} from 'option-t';
import * as Rx from 'rxjs';

import {CommandList} from '../../domain/CommandType';
import {DomainState} from '../../domain/DomainState';
import {Channel} from '../../domain/Channel';
import {ChannelId} from '../../domain/ChannelDomain';
import {User} from '../../domain/User';
import {MessageActionCreator} from '../../intent/action/MessageActionCreator';
import {UIActionCreator} from '../../intent/action/UIActionCreator';

const words: Array<string> = CommandList.map(function(item){
    return item.toLowerCase();
});

class InputValue {

    actual: string;
    suggstedIndex: Option<number>;

    constructor(actual: string, suggstedIndex: Option<number>) {
        this.actual = actual;
        this.suggstedIndex = suggstedIndex;
    }
}

export class InputBoxView {

    private _element: Element;
    private _domain: DomainState;
    private _currentNetworkId: number;
    private _currntChannel: Option<Channel>;

    private _textInput: HTMLInputElement;
    private _nickElement: HTMLElement;
    private _disposer: Rx.Subscription;

    private _msgAction: MessageActionCreator;

    private _inputVal: InputValue;
    private _lastSuggestionCache: Array<string> | undefined;
    private _isSuggestion: boolean;

    constructor(domain: DomainState, element: Element, msgAction: MessageActionCreator, uiAction: UIActionCreator) {
        this._element = element;
        this._domain = domain;
        this._currentNetworkId = -1;
        this._currntChannel = new None<Channel>();
        this._textInput = element.querySelector('#js-input') as HTMLInputElement;
        this._nickElement = element.querySelector('#js-nick') as HTMLElement;

        const disposer = new Rx.Subscription();
        this._disposer = disposer;
        this._msgAction = msgAction;

        disposer.add(uiAction.dispatcher().focusInputBox.subscribe(() => {
            this._focusInput();
        }));

        disposer.add(domain.getSelectedChannel().subscribe((id: ChannelId) => {
            const channel = this._domain.networkSet.getChannelById(id);
            const networkId = channel.map(function(channel: Channel){
                return channel.getNetwork().id;
            }).unwrap();

            this._currentNetworkId = networkId;
            this._currntChannel = channel;
        }));

        disposer.add(domain.getNetworkDomain().updatedNickname().subscribe((data) => {
            if (this._currentNetworkId !== data.networkId) {
                return;
            }

            this.setNickname(data.nick);
        }));

        this._inputVal = new InputValue('', new None<number>());
        this._lastSuggestionCache = undefined;
        this._isSuggestion = false;

        this._init();
    }

    private _init(): void {
        this._element.addEventListener('submit', this);
        this._textInput.addEventListener('keydown', this);
        this._textInput.addEventListener('input', this);
    }

    handleEvent(aEvent: Event): void {
        switch (aEvent.type) {
            case 'submit':
                this.onSubmit(aEvent);
                break;
            case 'keydown':
                this.onKeydown(aEvent as KeyboardEvent);
                break;
            case 'input':
                this.onInput(aEvent);
                break;
        }
    }

    onSubmit(aEvent: Event): void {
        aEvent.preventDefault();

        const input = this._textInput;
        const text = input.value;
        const channelId = this._domain.currentTab.channelId;
        const id = channelId.expect('the input box cannot submitted if any channel is not selected');

        // lock input field until dispatching to input command.
        input.readOnly = true;
        this._msgAction.inputCommand(id, text);
        input.value = '';
        input.readOnly = false;
    }

    private _focusInput(): void {
        this._textInput.focus();
    }

    onKeydown(aEvent: KeyboardEvent): void {
        if (aEvent.target !== this._textInput) {
            return;
        }

        const keyCode = aEvent.keyCode;
        const key = aEvent.key;

        const isTabKey = (key === 'Tab' || keyCode === 9); // DOM_VK_TAB
        if (isTabKey) {
            aEvent.preventDefault();
            this.autocomplete();
            return;
        }
        else {
            const pressShiftKey = aEvent.shiftKey;
            const pressCtrlKey = aEvent.ctrlKey;
            const pressMetaKey = aEvent.metaKey;
            if (pressCtrlKey || pressMetaKey) {
                return;
            }

            const isKeyK = (key === 'k' || keyCode === 75); // DOM_VK_K
            const isKeyL = (key === 'l' || keyCode === 76); // DOM_VK_L

            const shouldClear = (isKeyL && pressCtrlKey) ||
                                (isKeyL && pressCtrlKey && pressShiftKey) ||
                                (isKeyK && pressMetaKey);
            if (!shouldClear) {
                return;
            }

            aEvent.preventDefault();
            this.clearLog();
        }
    }

    setNickname(nickname: string): void {
        const target = this._nickElement;
        target.textContent = nickname + ':';
    }

    autocomplete(): void {
        const currentValue = this._inputVal.actual;
        if (currentValue === '') {
            return;
        }

        let index = 0;
        if (this._lastSuggestionCache === undefined && this._inputVal.suggstedIndex.isNone) {
            const suggestion = this._createSuggestion(currentValue);
            index = 0;

            this._lastSuggestionCache = suggestion;
        }
        else {
            const newly = this._inputVal.suggstedIndex.unwrap() + 1;
            index = (newly > (this._lastSuggestionCache!.length - 1)) ? 0 : newly;
        }

        if (this._lastSuggestionCache!.length === 0) {
            return;
        }

        this._inputVal = new InputValue(this._inputVal.actual, new Some(index));
        this._isSuggestion = true;
        this._textInput.value = this._lastSuggestionCache![index];
        this._isSuggestion = false;
    }

    clearLog(): void {
        if (this._currntChannel.isNone) {
            return;
        }

        const channel = this._currntChannel.unwrap();
        this._msgAction.clear(channel.id);
    }

    onInput(_: Event): void {
        if (this._isSuggestion) {
            return;
        }

        const current = this._textInput.value;
        this._inputVal = new InputValue(current, new None<number>());
        this._lastSuggestionCache = undefined;
    }

    private _createSuggestion(value: string): Array<string> {
        const candidate: Array<string> = ([] as Array<string>).concat(words);
        const users: Option<Array<User>> = this._currntChannel.map(function(channel){
            return channel.userList();
        });

        if (users.isSome) {
            for (let user of users.unwrap()) {
                const n = user.nickname;
                candidate.push(n.toLowerCase());
            }
        }

        return candidate.filter(function(word: string, item: string){
            return item.indexOf(word) === 0;
        }.bind(null, value.toLowerCase()));
    }
}
