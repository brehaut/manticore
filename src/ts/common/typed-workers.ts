module manticore.workers {
    // utilities for working with regular web workers in a typesafe way
    export interface ITypedMessageEvent<T> extends MessageEvent {
        data: T;
    }
    
    export interface ITypedWorker<TIncoming, TOutgoing> {
        postMessage(message: TIncoming);
        onmessage(message: ITypedMessageEvent<TOutgoing>);
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
    
    // internal workers are worker like objects that do not own the process space 
    // that the execute in. 
    export interface ILightWeightMessageEvent<TRecv>  {
        data: TRecv;
    }    
    
    export interface ILightWeightWorkerContext<TSend, TRecv> {
        postMessage(message: TRecv);
        onmessage(message: ILightWeightMessageEvent<TSend>);
        close();
    }
    
  
    export class LightWeightWorker<TIncoming, TOutgoing> implements ITypedWorker<TIncoming, TOutgoing> {
        public onmessage: (message:ILightWeightMessageEvent<TOutgoing>) => void = undefined;
        
        private internalWorker:ILightWeightWorkerContext<TIncoming, TOutgoing> = {
            onmessage: undefined,
            postMessage: (message) => {
                this.dispatchMessage(message);
            },
            close: () => this.terminate()
        }
        
        constructor(initialise:(worker:ILightWeightWorkerContext<TIncoming, TOutgoing>) => void) {
            initialise(this.internalWorker);
        }
        
        public postMessage(message: TIncoming) {
            if (!this.internalWorker || !this.internalWorker.onmessage) return;
            this.internalWorker.onmessage({ data: message });  
        }
        
        public terminate() {
            this.internalWorker.onmessage = undefined;
            this.internalWorker.postMessage = (_) => undefined;
            this.internalWorker = undefined;
        }
        
        private dispatchMessage(message:TOutgoing) {
            if (!this.onmessage) return;
            
            this.onmessage({ data: message });            
        }
    }
}