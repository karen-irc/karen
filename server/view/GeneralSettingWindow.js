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

export class GeneralSettingWindow extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let prefetchArea = null;
        if (this.props.prefetch) {
            prefetchArea = [
                <div key='links-and-urls'
                     className='col-sm-12'>
                    <h2>Links and URLs</h2>
                </div>,

                <div key='auto-expand-thumbnails'
                     className='col-sm-6'>
                    <label className='opt'>
                        <input type='checkbox' name='thumbnails'/>
                        Auto-expand thumbnails
                    </label>
                </div>,
                <div key='auto-expand-lins'
                     className='col-sm-6'>
                    <label className='opt'>
                        <input type='checkbox' name='links'/>
                        Auto-expand links
                    </label>
                </div>,
            ];
        }

        return (
            <div id='settings' data-title='Settings' className='window'>
                <div className='header'>
                    <button className='lt'></button>
                </div>
                <div className='container'>
                    <div className='row'>
                        <div className='col-sm-12'>
                            <h1 className='title'>Settings</h1>
                        </div>
                        <div className='col-sm-12'>
                            <h2>Messages</h2>
                        </div>
                        <div className='col-sm-6'>
                            <label className='opt'>
                                <input type='checkbox' name='join'/>
                                Show joins
                            </label>
                        </div>
                        <div className='col-sm-6'>
                            <label className='opt'>
                                <input type='checkbox' name='motd'/>
                                Show motd
                            </label>
                        </div>
                        <div className='col-sm-6'>
                            <label className='opt'>
                                <input type='checkbox' name='part'/>
                                Show parts
                            </label>
                        </div>
                        <div className='col-sm-6'>
                            <label className='opt'>
                                <input type='checkbox' name='nick'/>
                                Show nick changes
                            </label>
                        </div>
                        <div className='col-sm-6'>
                            <label className='opt'>
                                <input type='checkbox' name='mode'/>
                                Show mode
                            </label>
                        </div>
                        <div className='col-sm-6'>
                            <label className='opt'>
                                <input type='checkbox' name='quit'/>
                                Show quits
                            </label>
                        </div>
                        <div className='col-sm-12'>
                            <h2>Visual Aids</h2>
                        </div>
                        <div className='col-sm-12'>
                            <label className='opt'>
                                <input type='checkbox' name='colors'/>
                                Enable colored nicknames
                            </label>
                        </div>

                        {prefetchArea}

                        <div className='col-sm-12'>
                            <h2>Notifications</h2>
                        </div>
                        <div className='col-sm-12'>
                            <label className='opt'>
                            <input id='badge' type='checkbox' name='badge'/>
                                Enable badge
                            </label>
                        </div>
                        <div className='col-sm-12'>
                            <label className='opt'>
                            <input type='checkbox' name='notification'/>
                                Enable notification sound
                            </label>
                        </div>
                        <div className='col-sm-12'>
                            <div className='opt'>
                                <button id='play'>Play sound</button>
                            </div>
                        </div>
                        <div className='col-sm-12'>
                            <h2>About karen</h2>
                        </div>
                        <div className='col-sm-12'>
                            <p className='about'>
                                {'You\'re currently running version '}
                                <small>{this.props.version}</small>
                                <br/>
                                <a href='https://github.com/karen-irc/karen/' target='_blank'>{'Check for updates'}</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
GeneralSettingWindow.propTypes = {
    prefetch: React.PropTypes.bool.isRequired,
    version: React.PropTypes.string.isRequired,
};
