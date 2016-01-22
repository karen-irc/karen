/**
 * @license MIT License
 *
 * Copyright (c) 2015 Tetsuharu OHZEKI <saneyuki.snyk@gmail.com>
 * Copyright (c) 2015 Yusuke Suzuki <utatane.tea@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/// <reference path="../../../../tsd/third_party/socket.io-client/socket.io-client.d.ts" />

import * as io from 'socket.io-client';
import * as Rx from 'rxjs';

export class SocketIoDriver {

    _socket: SocketIOClient.Socket;

    constructor() {
        this._socket = io.connect();
    }

    error(): Rx.Observable<any> {
        return new Rx.Observable((observer: Rx.Subscriber<any>) => {
            const topic = 'error';
            const callback = (e: any) => {
                observer.error(e);
            };
            this._socket.on(topic, callback);

            return new Rx.Subscription(() => {
                this._socket.off(topic, callback);
            });
        });
    }

    connectError(): Rx.Observable<void> {
        return Rx.Observable.create((observer: Rx.Observer<any>) => {
            const topic = 'connect_error';
            const callback = () => {
                observer.next(undefined);
            };
            this._socket.on(topic, callback);

            return new Rx.Subscription(() => {
                this._socket.off(topic, callback);
            });
        });
    }

    disconnect(): Rx.Observable<void> {
        return Rx.Observable.create((observer: Rx.Observer<any>) => {
            const topic = 'disconnect';
            const callback = () => {
                observer.next(undefined);
            };
            this._socket.on(topic, callback);

            return new Rx.Subscription(() => {
                this._socket.off(topic, callback);
            });
        });
    }

    auth(): Rx.Observable<any> {
        return Rx.Observable.create((observer: Rx.Observer<any>) => {
            const topic = 'auth';
            const callback = (data: any) => {
                observer.next(data);
            };
            this._socket.on(topic, callback);

            return new Rx.Subscription(() => {
                this._socket.off(topic, callback);
            });
        });
    }

    init(): Rx.Observable<any> {
        return Rx.Observable.create((observer: Rx.Observer<any>) => {
            const topic = 'init';
            const callback = (data: any) => {
                observer.next(data);
            };
            this._socket.on(topic, callback);

            return new Rx.Subscription(() => {
                this._socket.off(topic, callback);
            });
        });
    }

    join(): Rx.Observable<any> {
        return Rx.Observable.create((observer: Rx.Observer<any>) => {
            const topic = 'join';
            const callback = (data: any) => {
                observer.next(data);
            };
            this._socket.on(topic, callback);

            return new Rx.Subscription(() => {
                this._socket.off(topic, callback);
            });
        });
    }

    message(): Rx.Observable<any> {
        return Rx.Observable.create((observer: Rx.Observer<any>) => {
            const topic = 'msg';
            const callback = (data: any) => {
                observer.next(data);
            };
            this._socket.on(topic, callback);

            return new Rx.Subscription(() => {
                this._socket.off(topic, callback);
            });
        });
    }

    more(): Rx.Observable<any> {
        return Rx.Observable.create((observer: Rx.Observer<any>) => {
            const topic = 'more';
            const callback = (data: any) => {
                observer.next(data);
            };
            this._socket.on(topic, callback);

            return new Rx.Subscription(() => {
                this._socket.off(topic, callback);
            });
        });
    }

    network(): Rx.Observable<any> {
        return Rx.Observable.create((observer: Rx.Observer<any>) => {
            const topic = 'network';
            const callback = (data: any) => {
                observer.next(data);
            };
            this._socket.on(topic, callback);

            return new Rx.Subscription(() => {
                this._socket.off(topic, callback);
            });
        });
    }

    nickname(): Rx.Observable<any> {
        return Rx.Observable.create((observer: Rx.Observer<any>) => {
            const topic = 'nick';
            const callback = (data: any) => {
                observer.next(data);
            };
            this._socket.on(topic, callback);

            return new Rx.Subscription(() => {
                this._socket.off(topic, callback);
            });
        });
    }

    part(): Rx.Observable<any> {
        return Rx.Observable.create((observer: Rx.Observer<any>) => {
            this._socket.on('part', (data: any) => {
                observer.next(data);
            });
        });
    }

    quit(): Rx.Observable<any> {
        return Rx.Observable.create((observer: Rx.Observer<any>) => {
            const topic = 'quit';
            const callback = (data: any) => {
                observer.next(data);
            };
            this._socket.on(topic, callback);

            return new Rx.Subscription(() => {
                this._socket.off(topic, callback);
            });
        });
    }

    toggle(): Rx.Observable<any> {
        return Rx.Observable.create((observer: Rx.Observer<any>) => {
            const topic = 'toggle';
            const callback = (data: any) => {
                observer.next(data);
            };
            this._socket.on(topic, callback);

            return new Rx.Subscription(() => {
                this._socket.off(topic, callback);
            });
        });
    }

    topic(): Rx.Observable<any> {
        return Rx.Observable.create((observer: Rx.Observer<any>) => {
            const topic = 'topic';
            const callback = (data: any) => {
                observer.next(data);
            };
            this._socket.on(topic, callback);

            return new Rx.Subscription(() => {
                this._socket.off(topic, callback);
            });
        });
    }

    users(): Rx.Observable<any> {
        return Rx.Observable.create((observer: Rx.Observer<any>) => {
            const topic = 'users';
            const callback = (data: any) => {
                observer.next(data);
            };
            this._socket.on(topic, callback);

            return new Rx.Subscription(() => {
                this._socket.off(topic, callback);
            });
        });
    }

    emit(name: string, obj: any): void {
        this._socket.emit(name, obj);
    }
}
