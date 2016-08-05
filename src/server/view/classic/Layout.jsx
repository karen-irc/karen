// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as React from 'react';

export function Layout(props) {
    return (
        <div id='wrap'>
            <div id='viewport'>
                {props.children}
            </div>
        </div>
    );
}
Layout.propTypes = {
    // This is an opaque data structure.
    // see https://facebook.github.io/react/docs/multiple-components.html
    children: React.PropTypes.any.isRequired,
};
