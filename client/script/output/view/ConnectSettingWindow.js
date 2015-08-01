import * as React from 'react';

import {ConnectionActionCreator} from '../../intent/action/ConnectionActionCreator';
import {ConnectionValue} from '../../domain/value/ConnectionSettings';

export class ConnectSettingWindow extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
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
                <form className='container' action='' onSubmit={this.onSubmit.bind(this)}>
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
                                   onChange={this.onChangeSetNetworkName.bind(this)} />
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
                                   onChange={this.onChangeSetServerURL.bind(this)} />
                        </div>
                        <div className='col-sm-3 col-xs-4'>
                            <div className='port'>
                                <input className='input'
                                       type='number'
                                       name='port'
                                       disabled={isConnecting}
                                       value={server.port}
                                       onChange={this.onChangeSetServerPort.bind(this)} />
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
                                   onChange={this.onChangeSetServerPass.bind(this)} />
                        </div>
                        <div className='col-sm-3'></div>
                        <div className='col-sm-9'>
                            <label className='tls'>
                                <input type='checkbox'
                                       name='tls'
                                       disabled={isConnecting}
                                       checked={server.useTLS}
                                       onChange={this.onChangeSetServerPass.bind(this)} />
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
                                   onChange={this.onChangeSetNickName.bind(this)} />
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
                                   onChange={this.onChangeSetUserName.bind(this)} />
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
                                   onChange={this.onChangeSetRealName.bind(this)} />
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
                                   onChange={this.onChangeSetChannel.bind(this)} />
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

    onChangeSetNetworkName(event) {
        const value = event.target.value;
        this.props.action.setNetworkName(value);
    }

    onChangeSetServerURL(event) {
        const value = event.target.value;
        this.props.action.setServerURL(value);
    }

    onChangeSetServerPort(event) {
        const value = event.target.value;
        const port = parseInt(value, 10);
        this.props.action.setServerPort(port);
    }

    onChangeSetServerPass(event) {
        const value = event.target.value;
        this.props.action.setServerPass(value);
    }

    onChangeUseTLS(event) {
        const isChecked = event.target.checked;
        this.props.action.shouldUseTLS(isChecked);
    }

    onChangeSetNickName(event) {
        const value = event.target.value;
        this.props.action.setNickName(value);
    }

    onChangeSetUserName(event) {
        const value = event.target.value;
        this.props.action.setUserName(value);
    }

    onChangeSetRealName(event) {
        const value = event.target.value;
        this.props.action.setRealName(value);
    }

    onChangeSetChannel(event) {
        const value = event.target.value;
        this.props.action.setChannel(value);
    }

    onSubmit(event) {
        event.preventDefault();

        const param = this.props.data;
        this.props.action.tryConnect(param);
    }
}
ConnectSettingWindow.propTypes = {
    action: React.PropTypes.instanceOf(ConnectionActionCreator).isRequired,
    data: React.PropTypes.instanceOf(ConnectionValue).isRequired,
};
