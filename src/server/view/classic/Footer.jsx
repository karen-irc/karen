// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as React from 'react';

export function Footer() {
    return (
        <footer id='footer'>
            <button className='icon sign-in'
                    data-target='#sign-in'
                    title='Sign in to karen'></button>
            <button className='icon connect'
                    data-target='#connect'
                    title='Connect to network'></button>
            <button className='icon settings'
                    data-target='#settings'
                    title='Client settings'></button>
            <button id='sign-out'
                    className='icon sign-out'
                    title='Sign out'></button>
        </footer>
    );
}
