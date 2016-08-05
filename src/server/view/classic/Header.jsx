// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as React from 'react';

export function Header({ theme }) {
    return (
        <head>
            <meta charSet='utf-8'/>
            <meta name='viewport' content='width=device-width, user-scalable=no'/>
            <meta name='referrer' content='no-referrer'/>

            <title>karen</title>

            <link rel='stylesheet' href='/css/bootstrap.css'/>
            <link rel='stylesheet' href='/dist/css/style.css'/>
            <link id='theme' rel='stylesheet' href={theme}/>

            <link rel='shortcut icon' href='/img/favicon.png'/>
            <link rel='icon' sizes='192x192' href='/img/touch-icon-192x192.png'/>
            <link rel='apple-touch-icon' sizes='120x120' href='/img/apple-touch-icon-120x120.png'/>

            <script defer='true' src='/dist/js/libs.min.js'></script>
            <script defer='true' src='/dist/js/karen.js'></script>
        </head>
    );
}
Header.propTypes = {
    theme: React.PropTypes.string.isRequired,
};
