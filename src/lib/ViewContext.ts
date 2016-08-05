// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
/**
 *  _ViewContext_ is a unit of a view content area and has a lifecycle itself.
 *
 *  This terminology is inspired by Android's Activity model and Windows' UWP app lifecycle.
 *
 *  This only provide a lifecycle of view context, does not manage any dependencies.
 *  Dependencies are managed by an application layer for each application
 *  as most suitable style.
 *
 *  An active context ensures:
 *
 *      - You have an ownership of the view content area under the given mount point.
 *      - You can render something to the mount point if you are called.
 *
 *  XXX:
 *  - If we would like to do some async operation when switching a view area,
 *    we would need to return `Promise<T>` to ensure the completed timing of such operation.
 */
export interface ViewContext {
    onActivate(mountpoint: Element): void;
    onDestroy(mountpoint: Element): void;

    onResume(mountpoint: Element): void;
    onSuspend(mountpoint: Element): void;
}

export class ViewContextStack {
    private _mountpoint: Element;
    private _stack: Array<ViewContext>;

    constructor(mountpoint: Element) {
        this._mountpoint = mountpoint;
        this._stack = [];
    }

    mountpoint(): Element {
        return this._mountpoint;
    }

    current(): ViewContext | void {
        const stack = this._stack;
        if (stack.length === 0) {
            return undefined;
        }

        return stack[stack.length - 1];
    }

    replace(aNew: ViewContext): void {
        const stack = this._stack;
        const mountpoint = this._mountpoint;

        const current = stack.pop();
        if (!!current) {
            current.onDestroy(mountpoint);
        }

        aNew.onActivate(mountpoint);
        stack.push(aNew);
    }

    push(aNext: ViewContext): void {
        const mountpoint = this._mountpoint;

        const stack = this._stack;
        const last = stack[stack.length - 1];
        if (!!last) {
            last.onSuspend(mountpoint);
        }

        stack.push(aNext);
        aNext.onActivate(mountpoint);
    }

    pop(): void {
        const mountpoint = this._mountpoint;

        const stack = this._stack;
        if (stack.length === 0) {
            return;
        }

        const last = stack.pop();
        if (last === undefined) {
            throw new TypeError();
        }

        last.onDestroy(mountpoint);

        const next = stack[stack.length - 1];
        if (!!next) {
            next.onResume(mountpoint);
        }
    }

    destroy(): void {
        const mountpoint = this._mountpoint;

        const stack = this._stack;
        const l = stack.length;
        for (let i = 0; i < l; ++i) {
            const ctx = stack[i];
            // tslint:disable-next-line:no-any
            stack[i] = undefined as any; // XXX: This `any` casting is only used to destroy.
            ctx.onDestroy(mountpoint);
        }

        // tslint:disable:no-any
        this._mountpoint = undefined as any; // XXX: This `any` casting is only used to destroy.
        this._stack = undefined as any; // XXX: This `any` casting is only used to destroy.
        // tslint:enable
        Object.freeze(this);
    }
}
