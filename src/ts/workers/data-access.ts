/// <reference path="../../../node_modules/typescript/lib/lib.webworker.d.ts" />
/// <reference path="../bestiary.ts" />
/// <reference path="../data.ts" />
/// <reference path="../messaging.ts" />

module manticore.workers.dataAccess {
    interface DataAccessMessageEvent extends MessageEvent {
        data: any
    }
    
    
    onmessage = (message) => {
        
    }
}