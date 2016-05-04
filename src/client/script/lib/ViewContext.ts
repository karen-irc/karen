/**
 * @license MIT License
 *
 * Copyright (c) 2016 Tetsuharu OHZEKI <saneyuki.snyk@gmail.com>
 * Copyright (c) 2016 Yusuke Suzuki <utatane.tea@gmail.com>
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