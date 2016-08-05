// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as React from 'react';

export function RizeHeader() {
    return (
        <head>
            <meta charSet='utf-8'/>
            <meta name='viewport' content='width=device-width, user-scalable=no'/>
            <meta name='referrer' content='no-referrer'/>

            <title>{'Project Rize'}</title>

            <script defer='true' src='/dist/js/karen.js'></script>
        </head>
    );
}
RizeHeader.propTypes = {};
