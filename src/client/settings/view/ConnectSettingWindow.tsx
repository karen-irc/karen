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

import * as React from 'react';

import {ConnectionActionCreator} from '../intent/ConnectionSettingIntent';
import {ConnectionValue} from '../domain/value/ConnectionSettings';
import {ConnectionSettingViewModel} from '../viewmodel/ConnectionStore';

interface Props {
    key?: React.Key;
    viewmodel: ConnectionSettingViewModel;
    action: ConnectionActionCreator;
    data: ConnectionValue;
}

export class ConnectSettingWindow extends React.Component<Props> {

    static propTypes = {
        //viewmodel: PropTypes.instanceOf(ConnectionSettingViewModel).isRequired,
        //action: PropTypes.instanceOf(ConnectionActionCreator).isRequired,
        //data: PropTypes.instanceOf(ConnectionValue).isRequired,
    };

    constructor(props: Props) {
        super(props);

        this.onChangeSetNetworkName = this.onChangeSetNetworkName.bind(this);
        this.onChangeSetServerURL = this.onChangeSetServerURL.bind(this);
        this.onChangeSetServerPort = this.onChangeSetServerPort.bind(this);
        this.onChangeSetServerPass = this.onChangeSetServerPass.bind(this);
        this.onChangeUseTLS = this.onChangeUseTLS.bind(this);
        this.onChangeSetNickName = this.onChangeSetNickName.bind(this);
        this.onChangeSetUserName = this.onChangeSetUserName.bind(this);
        this.onChangeSetRealName = this.onChangeSetRealName.bind(this);
        this.onChangeSetChannel = this.onChangeSetChannel.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    render(): JSX.Element {
        const server = this.props.data.network;
        const user = this.props.data.personal;

        const canConnect = this.props.data.canConnect;
        const isConnecting = false;
        const username = (user.username !== undefined && user.username !== '') ?
            user.username :
            user.nickname;

        return (
            <div id='connect' data-title='Connect' className='window'>
                <div className='header'>
                    <button className='lt'></button>
                </div>
                <form className='container' action='' onSubmit={this.onSubmit}>
                    <div className='row'>
                        <div className='col-sm-12'>
                            <h1 className='title'>Connect</h1>
                        </div>
                        <div className='col-sm-12'>
                            <h2>Network settings</h2>
                        </div>
                        <div className='col-sm-3'>
                            <label>Name</label>
                        </div>
                        <div className='col-sm-9'>
                            <input className='input'
                                   type='text'
                                   name='name'
                                   disabled={isConnecting}
                                   value={server.name}
                                   onChange={this.onChangeSetNetworkName} />
                        </div>
                        <div className='col-sm-3'>
                            <label>Server</label>
                        </div>
                        <div className='col-sm-6 col-xs-8'>
                            <input className='input'
                                   type='text'
                                   name='host'
                                   disabled={isConnecting}
                                   value={server.url}
                                   onChange={this.onChangeSetServerURL} />
                        </div>
                        <div className='col-sm-3 col-xs-4'>
                            <div className='port'>
                                <input className='input'
                                       type='number'
                                       name='port'
                                       disabled={isConnecting}
                                       value={String(server.port)}
                                       onChange={this.onChangeSetServerPort} />
                            </div>
                        </div>
                        <div className='clearfix'></div>
                        <div className='col-sm-3'>
                            <label>Password</label>
                        </div>
                        <div className='col-sm-9'>
                            <input className='input'
                                   type='password'
                                   name='password'
                                   disabled={isConnecting}
                                   value={server.pass}
                                   onChange={this.onChangeSetServerPass} />
                        </div>
                        <div className='col-sm-3'></div>
                        <div className='col-sm-9'>
                            <label className='tls'>
                                <input type='checkbox'
                                       name='tls'
                                       disabled={isConnecting}
                                       checked={server.useTLS}
                                       onChange={this.onChangeUseTLS} />
                                Enable TLS/SSL
                            </label>
                        </div>
                        <div className='clearfix'></div>
                        <div className='col-sm-12'>
                            <h2>User preferences</h2>
                        </div>
                        <div className='col-sm-3'>
                            <label>Nick</label>
                        </div>
                        <div className='col-sm-5'>
                            <input className='input nick'
                                   type='text'
                                   name='nick'
                                   disabled={isConnecting}
                                   value={user.nickname}
                                   onChange={this.onChangeSetNickName} />
                        </div>
                        <div className='clearfix'></div>
                        <div className='col-sm-3'>
                            <label>Username</label>
                        </div>
                        <div className='col-sm-5'>
                            <input className='input username'
                                   type='text'
                                   name='username'
                                   disabled={isConnecting}
                                   value={username}
                                   onChange={this.onChangeSetUserName} />
                        </div>
                        <div className='clearfix'></div>
                        <div className='col-sm-3'>
                            <label>Real name</label>
                        </div>
                        <div className='col-sm-9'>
                            <input className='input'
                                   type='text'
                                   name='realname'
                                   disabled={isConnecting}
                                   value={user.realname}
                                   onChange={this.onChangeSetRealName} />
                        </div>
                        <div className='col-sm-3'>
                            <label>Channels</label>
                        </div>
                        <div className='col-sm-9'>
                            <input className='input'
                                   type='text'
                                   name='join'
                                   disabled={isConnecting}
                                   value={user.channel}
                                   onChange={this.onChangeSetChannel} />
                        </div>
                        <div className='col-sm-3 clearfix'></div>
                        <div className='col-sm-9'>
                            <button type='submit'
                                    className='btn'
                                    disabled={isConnecting || !canConnect}>
                                Connect
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }

    onChangeSetNetworkName(event: React.FormEvent<HTMLInputElement>): void {
        const value = (event.target as HTMLInputElement).value;
        this.props.viewmodel.networkName().setValue(value);
    }

    onChangeSetServerURL(event: React.FormEvent<HTMLInputElement>): void {
        const value = (event.target as HTMLInputElement).value;
        this.props.viewmodel.serverUrl().setValue(value);
    }

    onChangeSetServerPort(event: React.FormEvent<HTMLInputElement>): void {
        const value = (event.target as HTMLInputElement).value;
        const port = parseInt(value, 10);
        this.props.viewmodel.serverPort().setValue(port);
    }

    onChangeSetServerPass(event: React.FormEvent<HTMLInputElement>): void {
        const value = (event.target as HTMLInputElement).value;
        this.props.viewmodel.serverPass().setValue(value);
    }

    onChangeUseTLS(event: React.FormEvent<HTMLInputElement>): void {
        const isChecked = (event.target as HTMLInputElement).checked;
        this.props.viewmodel.useTLS().setValue(isChecked);
    }

    onChangeSetNickName(event: React.FormEvent<HTMLInputElement>): void {
        const value = (event.target as HTMLInputElement).value;
        this.props.viewmodel.nickname().setValue(value);
    }

    onChangeSetUserName(event: React.FormEvent<HTMLInputElement>): void {
        const value = (event.target as HTMLInputElement).value;
        this.props.viewmodel.username().setValue(value);
    }

    onChangeSetRealName(event: React.FormEvent<HTMLInputElement>): void {
        const value = (event.target as HTMLInputElement).value;
        this.props.viewmodel.realname().setValue(value);
    }

    onChangeSetChannel(event: React.FormEvent<HTMLInputElement>): void {
        const value = (event.target as HTMLInputElement).value;
        this.props.viewmodel.channel().setValue(value);
    }

    onSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        const param = this.props.data;
        this.props.action.tryConnect(param);
    }
}
