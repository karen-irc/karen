/**
 * @license mit license
 *
 * copyright (c) 2015 tetsuharu ohzeki <saneyuki.snyk@gmail.com>
 * copyright (c) 2015 yusuke suzuki <utatane.tea@gmail.com>
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

export class InputForm extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <form id='form' action=''>
                <div className='inner'>
                    <button className='submit' type='submit'>
                        Send
                    </button>
                    <div className='input'>
                        <label htmlFor='input'
                               id='nick'></label>
                        <input id='input'
                               className='mousetrap'
                               autoComplete='off'/>
                    </div>
                </div>
            </form>
        );
    }
}
