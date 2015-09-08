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

/// <reference path="./third_party/react/react.d.ts"/>

declare module 'react-dom' {
    import React = require('react');

    type DOMElement<P> = React.DOMElement<P>;
    type DOMComponent<P> = React.DOMComponent<P>;

    type ClassicElement<P> = React.ClassicElement<P>;
    type ClassicComponent<P, S> = React.ClassicComponent<P, S>;

    type ReactElement<P> = React.ReactElement<P>;
    type Component<P, S> = React.Component<P, S>;

    export function render<P>(
        element: DOMElement<P>,
        container: Element,
        callback?: () => any): DOMComponent<P>;
    export function render<P, S>(
        element: ClassicElement<P>,
        container: Element,
        callback?: () => any): ClassicComponent<P, S>;
    export function render<P, S>(
        element: ReactElement<P>,
        container: Element,
        callback?: () => any): Component<P, S>;

    export function unmountComponentAtNode(container: Element): boolean;

    export function findDOMNode<TElement extends Element>(
        componentOrElement: Component<any, any> | Element): TElement;
    export function findDOMNode(
        componentOrElement: Component<any, any> | Element): Element;
}

declare module 'react-dom/server' {
    import React = require('react');
    type ReactElement<P> = React.ReactElement<P>;

    export function renderToString(element: ReactElement<any>): string;
    export function renderToStaticMarkup(element: ReactElement<any>): string;
}
