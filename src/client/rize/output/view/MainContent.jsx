/**
 * MIT License
 *
 * Copyright (c) 2016 Tetsuharu OHZEKI <saneyuki.snyk@gmail.com>
 * Copyright (c) 2016 Yusuke Suzuki <utatane.tea@gmail.com>
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
/// <reference path="../../../../tsd/third_party/react/react.d.ts" />

import * as React from 'react';

import {RizeNetworkValue} from '../../domain/NetworkDomain';
import {RizeNetworkSetValue} from '../../domain/NetworkSetDomain';
import {UIAction} from '../../intent/UIAction';

export function MainContent({ action, model, }) {
    return (
        <div>
            <h1>{'Thé des Alizés'}</h1>
            <div style={{ 'display': 'flex', 'flex-direction': 'row', }}>
                <NetworkAddForm action={action}/>
                <DumpNetworkSet action={action} model={model}/>
            </div>
        </div>
    );
}
MainContent.propTypes = {
    action: React.PropTypes.instanceOf(UIAction).isRequired,
    model: React.PropTypes.instanceOf(RizeNetworkSetValue).isRequired,
};

function DumpNetworkSet({ model, action }) {
    const list = model.list().map((item) => <DumpNetwork key={item.id()} action={action} model={item} />);
    return (
        <ul>{list}</ul>
    );
}
DumpNetworkSet.propTypes = {
    action: React.PropTypes.instanceOf(UIAction).isRequired,
    model: React.PropTypes.instanceOf(RizeNetworkSetValue).isRequired,
};

class DumpNetwork extends React.Component {
    constructor(props) {
        super(props);

        this.onClickSuccessConnection = this.onClickSuccessConnection.bind(this);
    }

    render() {
        const model = this.props.model;

        return (
            <li>
                <span>{JSON.stringify(model)}</span>
                <button onClick={this.onClickSuccessConnection}>{'success connection'}</button>
            </li>
        );
    }

    onClickSuccessConnection(event) {
        event.preventDefault();

        const id = this.props.model.id();
        this.props.action.successConnection(id);
    }
}
DumpNetwork.propTypes = {
    action: React.PropTypes.instanceOf(UIAction).isRequired,
    model: React.PropTypes.instanceOf(RizeNetworkValue).isRequired,
};


class NetworkAddForm extends React.Component {

    constructor(props) {
        super(props);

        this._inputAddNetwork = null;

        this.onClickAddNetwork = this.onClickAddNetwork.bind(this);
    }

    render() {
        const ref = (ref) => {
            this._inputAddNetwork = ref;
        };
        return (
            <form>
                <fieldset>
                    <legend>{'add network'}</legend>
                    <label>
                        {'network name'}
                        <input type='text' ref={ref}/>
                    </label>
                    <button type='button' onClick={this.onClickAddNetwork}>{'add network'}</button>
                </fieldset>
            </form>
        );
    }

    onClickAddNetwork(aEvent) {
        aEvent.preventDefault();

        const element = this._inputAddNetwork;
        this.props.action.addNetwork(element.value);
    }
}
NetworkAddForm.propTypes = {
    action: React.PropTypes.instanceOf(UIAction).isRequired,
};