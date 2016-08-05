// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
export class Hostmask {

    /**
     *  @constructor
     *  @param  {?} attr
     */
    constructor(attr) {
        const data = Object.assign({
            nick: '',
            username: '',
            hostname: '',
            string: '',
        }, attr);

        /** @type   {string}    */
        this.nick = data.nick;

        /** @type   {string}    */
        this.username = data.username;

        /** @type   {string}    */
        this.hostname = data.hostname;

        /** @type   {number}    */
        this.string = data.string;
    }
}
