// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
export class AudioDriver {
    private _audio: HTMLAudioElement | void;

    constructor(path: string) {
        const audio = new Audio();
        audio.src = path;

        /** @type   {Audio} */
        this._audio = audio;
    }

    destroy(): void {
        this._audio = undefined;
    }

    play(): void {
        this._audio.play();
    }
}
