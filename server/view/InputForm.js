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
