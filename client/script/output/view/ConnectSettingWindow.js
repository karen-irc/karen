import * as React from 'react';

class State {
    constructor(state, isTrying) {
        const username = (state.username !== undefined && state.username !== '') ?
            state.username :
            state.nick;

        this.name = state.name;
        this.host = state.host;
        this.port = state.port;
        this.password = state.password;
        this.tls = state.tls;
        this.nick = state.nick;
        this.username = username;
        this.realname = state.realname;
        this.join = state.join;

        this.isTrying = false;
    }
}

export class ConnectSettingWindow extends React.Component {

    constructor(props) {
        super(props);
        this.state = new State(props.settings, false);

        this.onSubmit = this.onSubmit.bind(this);
    }

    render() {
        const settings = this.state;
        const isTrying = this.state.isTrying;
        const username = (settings.username !== undefined && settings.username !== '') ?
            settings.username :
            settings.nick;

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
                                   name='name'
                                   readOnly={isTrying}
                                   value={settings.name}
                                   onChange={this.onChange.bind(this, 'name')} />
                        </div>
                        <div className='col-sm-3'>
                            <label>Server</label>
                        </div>
                        <div className='col-sm-6 col-xs-8'>
                            <input className='input'
                                   name='host'
                                   readOnly={isTrying}
                                   value={settings.host}
                                   onChange={this.onChange.bind(this, 'host')} />
                        </div>
                        <div className='col-sm-3 col-xs-4'>
                            <div className='port'>
                                <input className='input'
                                       name='port'
                                       readOnly={isTrying}
                                       value={settings.port}
                                       onChange={this.onChange.bind(this, 'port')} />
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
                                   readOnly={isTrying}
                                   value={settings.password}
                                   onChange={this.onChange.bind(this, 'password')} />
                        </div>
                        <div className='col-sm-3'></div>
                        <div className='col-sm-9'>
                            <label className='tls'>
                                <input type='checkbox'
                                       name='tls'
                                       readOnly={isTrying}
                                       checked={settings.tls}
                                       onChange={this.onChange.bind(this, 'tls')} />
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
                                   name='nick'
                                   readOnly={isTrying}
                                   value={settings.nick}
                                   onChange={this.onChange.bind(this, 'nick')} />
                        </div>
                        <div className='clearfix'></div>
                        <div className='col-sm-3'>
                            <label>Username</label>
                        </div>
                        <div className='col-sm-5'>
                            <input className='input username'
                                   name='username'
                                   readOnly={isTrying}
                                   value={username}
                                   onChange={this.onChange.bind(this, 'username')} />
                        </div>
                        <div className='clearfix'></div>
                        <div className='col-sm-3'>
                            <label>Real name</label>
                        </div>
                        <div className='col-sm-9'>
                            <input className='input'
                                   name='realname'
                                   readOnly={isTrying}
                                   value={settings.realname}
                                   onChange={this.onChange.bind(this, 'realname')} />
                        </div>
                        <div className='col-sm-3'>
                            <label>Channels</label>
                        </div>
                        <div className='col-sm-9'>
                            <input className='input'
                                   name='join'
                                   readOnly={isTrying}
                                   value={settings.join}
                                   onChange={this.onChange.bind(this, 'join')} />
                        </div>
                        <div className='col-sm-3 clearfix'></div>
                        <div className='col-sm-9'>
                            <button type='submit'
                                    className='btn'
                                    disabled={isTrying}>
                                Connect
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }

    onChange(name, event) {
        const value = event.target.value;
        this.setState({
            [name]: value,
        });
    }

    onSubmit(event) {
        event.preventDefault();

        const values = new State(this.state, false);
        this.props.socket.emit('conn', values);

        this.setState({
            isTrying: true,
        });
    }
}
ConnectSettingWindow.propTypes = {
    settings: React.PropTypes.object.isRequired,
    socket: React.PropTypes.object.isRequired,
};
