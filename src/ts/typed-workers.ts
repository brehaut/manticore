module manticore.workers {
    export interface ITypedMessageEvent<T> extends MessageEvent {
        data: T;
    }
    
    export interface ITypedWorker<TSend, TRecv> {
        postMessage(message: TSend);
        onmessage(message: ITypedMessageEvent<TRecv>);
    }
    
    export function newWorker<TSend, TRecv>(script: string): ITypedWorker<TSend, TRecv> {
        return new Worker(script);
    }  
}