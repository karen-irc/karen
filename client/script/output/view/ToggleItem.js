import * as React from 'react';

export class ToggleItem extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const item = this.props.item;

        let content = null;
        if (item.type === 'image') {
            content = (
                <a href={item.link} target='_blank'>
                    <img src={item.link} />
                </a>
            );
        }
        else {
            const thumb = (item.thumb === '') ?
                null :
                <img src={item.thumb} className='thumb'/>;

            content = (
                <a href={item.link} target='_blank'>
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
}

ToggleItem.propTypes = {
    item: React.PropTypes.object.isRequired,
};
