// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as React from 'react';

import {RizeHeader} from './RizeHeader';

export function RizeIndex() {
    return (
        <html>
            <RizeHeader/>
            <body>
                <div id='js-mountpoint-app'/>
            </body>
        </html>
    );
}
RizeIndex.propTypes = {};
