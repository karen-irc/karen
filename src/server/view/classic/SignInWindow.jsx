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

export function SignInWindow() {
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
