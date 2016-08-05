// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
declare class Origin {
    scheme: string;
    host: string;
    port: number;
    toString(): string;
}

export const origin: {
    FIRST: Origin,
    SECOND: Origin,
};
