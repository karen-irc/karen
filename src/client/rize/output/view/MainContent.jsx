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

import {RizeNetworkSetValue} from '../../domain/NetworkSetDomain';
import {UIAction} from '../../intent/UIAction';

export function MainContent({ action, model, }) {
    return (
        <div>
            <h1>{'Thé des Alizés'}</h1>
            <div style={{ 'display': 'flex', 'flex-direction': 'row', }}>
                <NetworkAddForm action={action}/>
                <DumpNetworkSet model={model}/>
            </div>
        </div>
    );
}
MainContent.propTypes = {
    action: React.PropTypes.instanceOf(UIAction).isRequired,
    model: React.PropTypes.instanceOf(RizeNetworkSetValue).isRequired,
};

function DumpNetworkSet({ model }) {
    const list = model.list().map((item) => <li key={item.id()}>{JSON.stringify(item)}</li>);
    return (
        <ul>{list}</ul>
    );
}
DumpNetworkSet.propTypes = {
    model: React.PropTypes.instanceOf(RizeNetworkSetValue).isRequired,
};


class NetworkAddForm extends React.Component {

    constructor(props) {
        super(props);

        this._inputAddNetwork = null;

        this.onClick = this.onClick.bind(this);
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
                    <button type="button" onClick={this.onClick}>{'add network'}</button>
                </fieldset>
            </form>
        );
    }

    onClick(aEvent) {
        aEvent.preventDefault();

        const element = this._inputAddNetwork;
        this.props.action.addNetwork(element.value);
    }
}
NetworkAddForm.propTypes = {
    action: React.PropTypes.instanceOf(UIAction).isRequired,
};