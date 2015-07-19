import * as React from 'react';

export class Sidebar extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <aside id='sidebar'>
                <div className='tse-content'>
                    <div className='networks'></div>
                    <div className='empty'>
                        {'You\'re not connected to any networks yet.'}
                    </div>
                </div>
            </aside>
        );
    }
}
