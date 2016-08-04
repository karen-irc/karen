export class MessageTextNode {
    readonly type: 'text';
    readonly value: string;

    constructor(v: string) {
        this.type = 'text';
        this.value = v;
    }
}
export function isMessageTextNode(node: MessageNode): node is MessageTextNode {
    return node.type === 'text';
}

export class MessageUriNode {
    readonly type: 'url';
    readonly value: string;

    constructor(v: string) {
        this.type = 'url';
        this.value = v;
    }
}
export function isMessageUriNode(node: MessageNode): node is MessageUriNode {
    return node.type === 'url';
}

export type MessageNode = MessageTextNode | MessageUriNode;

export class MsgContainerNode {

    readonly children: Array<MessageNode>;

    constructor() {
        this.children = [];
    }

    push(node: MessageNode): void {
        this.children.push(node);
    }
}
