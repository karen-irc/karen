import {ViewContext} from '../../../lib/ViewContext';

export class RoomContext implements ViewContext {
    onActivate(_mountpoint: Element): void {}
    onDestroy(_mountpoint: Element): void {}
    onResume(_mountpoint: Element): void {}
    onSuspend(_mountpoint: Element): void {}
}
