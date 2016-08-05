// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
export interface Action<Dispatcher> {
    dispatcher(): Dispatcher;
}
