import { Observable } from 'rxjs/Observable';

export interface Repository<T> {
    asObservable(): Observable<T>;
}
