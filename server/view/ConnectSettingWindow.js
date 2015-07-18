import * as React from 'react';

export class ConnectSettingWindow extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const settings = this.props.settings;

        return (
            <div id='connect' data-title='Connect' className='window'>
                <div className='header'>
                    <button className='lt'></button>
                </div>
                <form className='container' action=''>
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
                            <input className='input' name='name' defaultValue={settings.name} />
                        </div>
                        <div className='col-sm-3'>
                            <label>Server</label>
                        </div>
                        <div className='col-sm-6 col-xs-8'>
                            <input className='input' name='host' defaultValue={settings.host}/>
                        </div>
                        <div className='col-sm-3 col-xs-4'>
                            <div className='port'>
                                <input className='input' name='port' defaultValue={settings.port}/>
                            </div>
                        </div>
                        <div className='clearfix'></div>
                        <div className='col-sm-3'>
                            <label>Password</label>
                        </div>
                        <div className='col-sm-9'>
                            <input className='input' type='password' name='password' defaultValue={settings.password}/>
                        </div>
                        <div className='col-sm-3'></div>
                        <div className='col-sm-9'>
                            <label className='tls'>
                                <input type='checkbox' name='tls' defaultChecked={settings.tls}/>
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
                            <input className='input nick' name='nick' defaultValue={settings.nick}/>
                        </div>
                        <div className='clearfix'></div>
                        <div className='col-sm-3'>
                            <label>Username</label>
                        </div>
                        <div className='col-sm-5'>
                            <input className='input username' name='username' defaultValue={settings.username}/>
                        </div>
                        <div className='clearfix'></div>
                        <div className='col-sm-3'>
                            <label>Real name</label>
                        </div>
                        <div className='col-sm-9'>
                            <input className='input' name='realname' className='input' defaultValue={settings.realname}/>
                        </div>
                        <div className='col-sm-3'>
                            <label>Channels</label>
                        </div>
                        <div className='col-sm-9'>
                            <input className='input' name='join' className='input' defaultValue={settings.join}/>
                        </div>
                        <div className='col-sm-3 clearfix'></div>
                        <div className='col-sm-9'>
                            <button type='submit' className='btn'>
                                Connect
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}
ConnectSettingWindow.propTypes = {
    settings: React.PropTypes.object.isRequired,
};
