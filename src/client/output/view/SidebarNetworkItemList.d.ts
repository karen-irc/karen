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

import { Option } from 'option-t';
import { StatelessComponent } from 'react';

import { MessageActionCreator } from '../../intent/action/MessageActionCreator';
import { UIActionCreator } from '../../intent/action/UIActionCreator';

import { ChannelId } from '../../domain/ChannelDomain';
import { Network } from '../../domain/Network';

interface SidebarNetworkItemProps {
    key?: any; // tslint:disable-line: no-any
    network: Network;
    selectedId: Option<ChannelId>;
    notableChannelSet: Set<ChannelId>;
    unreadCountMap: Map<ChannelId, number>;
    msgAction: MessageActionCreator;
    uiAction: UIActionCreator;
}

export const SidebarNetworkItem: StatelessComponent<SidebarNetworkItemProps>;
