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

export class Header extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const theme = this.props.theme;

        return (
            <head>
                <meta charSet='utf-8'/>
                <meta name='viewport' content='width=device-width, user-scalable=no'/>
                <meta httpEquiv='X-UA-Compatible' content='IE=edge'/>
                <meta name='apple-mobile-web-app-capable' content='yes'/>
                <meta name='apple-mobile-web-app-status-bar-style' content='black-translucent'/>
                <meta name='mobile-web-app-capable' content='yes'/>

                <title>karen</title>

                <link rel='stylesheet' href='css/bootstrap.css'/>
                <link rel='stylesheet' href='css/style.css'/>
                <link id='theme' rel='stylesheet' href={theme}/>

                <link rel='shortcut icon' href='/img/favicon.png'/>
                <link rel='icon' sizes='192x192' href='/img/touch-icon-192x192.png'/>
                <link rel='apple-touch-icon' sizes='120x120' href='/img/apple-touch-icon-120x120.png'/>

                <script defer='true' src='js/libs.min.js'></script>
                <script defer='true' src='js/karen.templates.js'></script>
                <script defer='true' src='js/karen.js'></script>
            </head>
        );
    }
}

Header.propTypes = {
    theme: React.PropTypes.string.isRequired,
};
