import {SessionId} from './ClientConnection';

export type LiveAccountId = number;

export interface LiveAccount {
    id(): LiveAccountId;
    connectionList(): Set<SessionId>;
}