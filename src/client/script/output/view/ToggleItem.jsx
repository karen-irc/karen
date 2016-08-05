// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as React from 'react';

export function ToggleItem({ item }) {
    let content = null;
    if (item.type === 'image') {
        content = (
            <a href={item.link} target='_blank' rel='noopener noreferrer'>
                <img src={item.link} />
            </a>
        );
    }
    else {
        const thumb = (item.thumb === '') ?
            null :
            <img src={item.thumb} className='thumb'/>;

        content = (
            <a href={item.link} target='_blank' rel='noopener noreferrer'>
                {thumb}
                <div className='head'>
                    {item.head}
                </div>
                <div className='body'>
                    {item.body}
                </div>
            </a>
        );
    }

    return (
        <div className='toggle-content'>
            {content}
        </div>
    );
}
ToggleItem.propTypes = {
    item: React.PropTypes.object.isRequired,
};
