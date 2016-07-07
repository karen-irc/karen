import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {ViewContext} from '../../script/lib/ViewContext';
import {RizeAppView} from '../output/view/RizeAppView';


export class ApplicationContext implements ViewContext {

    onActivate(mountpoint: Element): void {
        const view = React.createElement(RizeAppView, undefined);
        ReactDOM.render(view, mountpoint);
    }

    onDestroy(mountpoint: Element): void {
        ReactDOM.unmountComponentAtNode(mountpoint);
    }

    onResume(_mountpoint: Element): void {}
    onSuspend(_mountpoint: Element): void {}
}
