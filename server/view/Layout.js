import * as React from 'react';

export class Layout extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div id='wrap'>
                <div id='viewport'>
                    {this.props.children}
                </div>
            </div>
        );
    }
}
Layout.propTypes = {
    // This is an opaque data structure.
    // see https://facebook.github.io/react/docs/multiple-components.html
    children: React.PropTypes.any.isRequired,
};
