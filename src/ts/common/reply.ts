module manticore.common.reply {
    export interface IReplyable {
        postMessage(message: any, transferrables?: any[]): void;
    }

    export function reply(source: IReplyable, ev: MessageEvent, message: any, transferrables?: any[]) {
        if (ev.ports.length > 0) {
            ev.ports[0].postMessage(message, transferrables);
        }
        else {
            source.postMessage(message, transferrables);
        }
    }
}