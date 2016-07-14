/*global URI */
import {MsgContainerNode, MessageTextNode, MessageUriNode} from './MessageNode';

/**
 *  @param  {string} src
 *  @returns    {MsgContainerNode}
 */
export function parseToMessageNode(src) {
    let prevStart = 0;
    const root = new MsgContainerNode();

    URI.withinString(src, function (url, start, end, src) {
        const prevEnd = start;
        if (prevEnd > prevStart) {
            const prev = src.slice(prevStart, prevEnd);
            const node = new MessageTextNode(prev);
            root.push(node);
        }
        prevStart = end;

        const urlNode = new MessageUriNode(url);
        root.push(urlNode);
        return url;
    });

    if (prevStart < src.length) {
        const node = new MessageTextNode(src.slice(prevStart, src.length));
        root.push(node);
    }

    return root;
}
