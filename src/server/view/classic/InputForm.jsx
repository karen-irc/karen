// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as React from 'react';

export function InputForm() {
    return (
        <form id='js-form' className='input-form' action=''>
            <div className='input-form__inner'>
                <label className='input-form__input-container'>
                    <span className='input-form__nick'>
                        <span id='js-nick' className='input-form__nick-holder'></span>
                    </span>
                    <input id='js-input'
                           className='input-form__input'
                           autoComplete='off'/>
                </label>
                <button type='submit' className='input-form__submit'>
                    {'Send'}
                </button>
            </div>
        </form>
    );
}
