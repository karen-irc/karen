// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
export class User {

    /**
     *  @constructor
     *  @param  {?} attr
     */
    constructor(attr) {
        const data = Object.assign({
            mode: '',
            name: '',
        }, attr);

        /** @type {string} */
        this.mode = data.mode;

        /** @type {string} */
        this.name = data.name;
    }
}
