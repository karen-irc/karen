import * as React from 'react';

export class SignInWindow extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div id='sign-in' data-title='Sign in' className='window'>
                <div className='header'>
                    <button className='lt'></button>
                </div>
                <form className='container' action=''>
                    <div className='row'>
                        <div className='col-xs-12'>
                            <h1 className='title'>Sign in</h1>
                        </div>
                        <div className='col-xs-12'>
                            <label>
                                Username
                                <input className='input' name='user'/>
                            </label>
                        </div>
                        <div className='col-xs-12'>
                            <label className='port'>
                                Password
                                <input className='input' type='password' name='password'/>
                            </label>
                        </div>
                        <div className='col-xs-12'>
                            <label className='remember'>
                                <input type='checkbox' name='remember' defaultChecked={true}/>
                                Stay signed in
                            </label>
                        </div>
                        <div className='col-xs-12 error' style={{ display: 'none', }}>
                            Authentication failed.
                        </div>
                        <div className='col-xs-12'>
                            <button type='submit' className='btn'>
                                Sign in
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}
