// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import {StatelessComponent} from 'react';

import {SidebarViewState} from '../viewmodel/SidebarStore';

interface SidebarProps {
    key?: any;
    model: SidebarViewState;
}

export const Sidebar: StatelessComponent<SidebarProps>;
