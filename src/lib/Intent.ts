export interface IntentProvider<TDispatcher> {
    dispatcher(): TDispatcher;
}
