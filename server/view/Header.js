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
                <script defer='true' src='js/karen.js'></script>
            </head>
        );
    }
}

Header.propTypes = {
    theme: React.PropTypes.string.isRequired,
};
