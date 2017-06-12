import crossroads from './crossroads';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription, } from 'rxjs/Subscription';

import { ViewContext } from '../ViewContext';

export type PathString = string;

type OnRouteFn = (id?: string) => ViewContext;
export type Route = [PathString, OnRouteFn];
export type RouteConfig = Array<Route>;

export const enum RoutingActionType {
    Push = 0,
    Replace = 1,
    StaticReload = 2,
}

export interface RoutingAction {
    type: RoutingActionType;
    path: PathString;
}

export class Router {

    private _router: typeof crossroads;
    private _intent: Observable<RoutingAction>;
    private _nextContext: Subject<ViewContext>;
    private _changedLocaton: Subject<PathString>;
    private _disposer: Subscription;

    private constructor(channel: Observable<RoutingAction>, config: RouteConfig) {
        this._router = crossroads.create();
        this._intent = channel;
        this._nextContext = new Subject<ViewContext>();
        this._changedLocaton = new Subject<PathString>();
        this._disposer = new Subscription();

        this._setupRouting(config);
    }

    static create(channel: Observable<RoutingAction>, routeConfig: RouteConfig): Router {
        const r = new Router(channel, routeConfig);
        return r;
    }

    private _setupRouting(list: RouteConfig): void {
        for (const [path, fn] of list) {
            this._router.addRoute(path, (id: string) => {
                const ctx: ViewContext = fn(id);
                this._nextContext.next(ctx);
                this._changedLocaton.next(path);
            });
        }

        this._router.bypassed.add((aReq: PathString) => {
            const e = new ReferenceError(`tried to route to the non-registered one: ${aReq}`);
            this._nextContext.error(e);
            console.error(e);
        });
    }

    activate(): void {
        const disposer = this._disposer;

        const intent = this._intent;
        const nextPath = intent.subscribe((action) => {
            this._router.parse(action.path);
        });
        disposer.add(nextPath);
    }

    destroy(): void {
        this._disposer.unsubscribe();

        this._changedLocaton.complete();
        this._changedLocaton.unsubscribe();

        this._nextContext.complete();
        this._nextContext.unsubscribe();

        // XXX: for destruction
        // tslint:disable:no-any
        this._disposer = null as any;
        this._changedLocaton = null as any;
        this._nextContext = null as any;
        // tslint:enable
    }
    /**
     *  @returns
     *      This represents the actual path by
     *      The component class which displays a url subscribes this to observe
     *      a url which it should display.
     */
    changedLocation(): Observable<RoutingAction> {
        return this._changedLocaton.zip(this._intent, (_, action) => {
            return action;
        });
    }

    nextContext(): Observable<ViewContext> {
        return this._nextContext;
    }
}

export function toPathPushAction(path: PathString): RoutingAction {
    return {
        type: RoutingActionType.Push,
        path,
    };
}

export function toPathReplaceAction(path: PathString): RoutingAction {
    return {
        type: RoutingActionType.Replace,
        path,
    };
}

export function toStaticReloadAction(path: PathString): RoutingAction {
    return {
        type: RoutingActionType.StaticReload,
        path,
    };
}
