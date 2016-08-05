// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
export class User {

    nickname: string;
    permission: string;

    constructor(raw: any) { // tslint:disable-line:no-any
        this.nickname = raw.name;
        this.permission = raw.mode;
    }

    /**
     *  @deprecated
     */
    get name() {
        return this.nickname;
    }

    /**
     *  @deprecated
     */
    get mode() {
        return this.permission;
    }
}
