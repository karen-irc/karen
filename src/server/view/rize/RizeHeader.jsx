/**
 * @license mit license
 *
 * copyright (c) 2016 tetsuharu ohzeki <saneyuki.snyk@gmail.com>
 * copyright (c) 2016 yusuke suzuki <utatane.tea@gmail.com>
 *
 * permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "software"), to deal
 * in the software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the software, and to permit persons to whom the software is
 * furnished to do so, subject to the following conditions:
 *
 * the above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the software.
 *
 * the software is provided "as is", without warranty of any kind, express or
 * implied, including but not limited to the warranties of merchantability,
 * fitness for a particular purpose and noninfringement. in no event shall the
 * authors or copyright holders be liable for any claim, damages or other
 * liability, whether in an action of contract, tort or otherwise, arising from,
 * out of or in connection with the software or the use or other dealings in
 * the software.
 */

import * as React from 'react';

export function RizeHeader() {
    return (
        <head>
            <meta charSet='utf-8'/>
            <meta name='viewport' content='width=device-width, user-scalable=no'/>
            <meta name='referrer' content='no-referrer'/>
            <link rel='stylesheet' media='all' href='/dist/css/bootstrap.css'/>

            <title>{'Project Rize'}</title>

            <script defer='true' src='/dist/js/karen.js'></script>
        </head>
    );
}
RizeHeader.propTypes = {};