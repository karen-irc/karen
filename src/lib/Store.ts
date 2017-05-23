import { Observable } from 'rxjs/Observable';

export interface Store<T> {
    compose(initial: Readonly<T>): Observable<T>;
}
