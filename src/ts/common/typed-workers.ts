module manticore.workers {
    // utilities for working with regular web workers in a typesafe way
    export interface ITypedMessageEvent<T> extends MessageEvent {
        data: T;
    }
    
    export interface ITypedWorker<TIncoming, TOutgoing> extends EventTarget {
        postMessage(message: TIncoming, ports?: (MessagePort|ArrayBuffer)[]): void;
        onmessage?: (message: ITypedMessageEvent<TOutgoing>) => void;
        addEventListener(type:"message", handler:(ev: ITypedMessageEvent<TOutgoing>)=>void): void;
    }
    
    export function newWorker<TSend, TRecv>(script: string): ITypedWorker<TSend, TRecv> {
        return new Worker(script);
    }  
    
    
    // wrap a workerlike object in a promise for other consumers
    export function workerPromise<TIn, TOut>(workerlike: { 
            onmessage: (message: {data: TOut}) => any;
            onclose?: () => any;
        }):Promise<TOut> {
        return new Promise((resolve, reject) => {
            workerlike.onmessage = (message) => resolve(message.data);  
            if (workerlike.onclose) {
                workerlike.onclose = () => reject(null);
            }
        })
    }
    
}