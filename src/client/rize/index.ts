// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import {RizeClient} from './rize';

// tslint:disable-next-line: no-namespace
declare global {
    interface Window {
        gKarenClient: RizeClient;
    }
}

window.gKarenClient = new RizeClient();
