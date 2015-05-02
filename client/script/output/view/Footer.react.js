/**
 * @license MIT License
 *
 * Copyright (c) 2015 Tetsuharu OHZEKI <saneyuki.snyk@gmail.com>
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

import React from 'react';
import {Tooltip, OverlayTrigger} from 'react-bootstrap';

let Footer = React.createClass({

    render: function () {
        return (
            <footer id='footer'>

                <Button className='icon sign-in'
                        tooltip='Sign in to karen'
                        target='#sign-in'
                        title='Sign in'/>

                <Button className='icon connect'
                        tooltip='Connect to network'
                        target='#connect'
                        title='Connect'/>

                <Button className='icon settings'
                        tooltip='Client settings'
                        target='#settings'
                        title='Settings'/>

                <Button className='icon sign-out'
                        tooltip='Sign out' />

            </footer>
        );
    },
});


let Button = React.createClass({

    propTypes: {
        className: React.PropTypes.string,
        tooltip: React.PropTypes.string.isRequired,
        target: React.PropTypes.string,
        title: React.PropTypes.string,
    },

    render: function () {
        let tooltip = <Tooltip>{this.props.tooltip}</Tooltip>;

        return (
            <OverlayTrigger placement='top'
                            overlay={tooltip}
                            delayShow={300}
                            delayHide={150}>
                <button type='button'
                        className={this.props.className}
                        data-target={this.props.target}
                        data-title={this.props.title} ></button>
            </OverlayTrigger>
        );
    },
});

export default Footer;
