// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
export class Setting {

    badge: boolean;
    join: boolean;
    links: boolean;
    mode: boolean;
    motd: boolean;
    nick: boolean;
    notification: boolean;
    part: boolean;
    thumbnails: boolean;
    quit: boolean;

    constructor(raw: any) { //tslint:disable-line:no-any
        const data = Object.assign({
            badge: false,
            join: true,
            links: true,
            mode: true,
            motd: false,
            nick: true,
            notification: true,
            part: true,
            thumbnails: true,
            quit: true,
        }, raw);

        this.badge = data.badge;

        this.join = data.join;

        this.links = data.links;

        this.mode = data.mode;

        this.motd = data.motd;

        this.nick = data.nick;

        this.notification = data.notification;

        this.part = data.part;

        this.thumbnails = data.thumbnails;

        this.quit = data.quit;
    }
}

export interface MessageSetting {
    showJoin: boolean;
    showPart: boolean;
    showMode: boolean;
    showMotd: boolean;
    showNickChange: boolean;
    showQuit: boolean;
}

export interface VisualSetting {
    enableNickColorful: boolean;
}

export interface LinkContentSetting {
    autoExpandThumbnail: boolean;
    autoExpandLinks: boolean;
}

export interface NotificationSetting {
    badge: boolean;
    notification: boolean;
}
