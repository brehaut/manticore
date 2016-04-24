/// <reference path="../../../node_modules/typescript/lib/lib.webworker.d.ts" />
/// <reference path="../bestiary.ts" />
/// <reference path="../data.ts" />

module manticore.workers.processing {
    interface ProcessingMessageEvent extends MessageEvent {
        data: [data.IParty, data.Monster[]];
    }
    
    onmessage = (message:ProcessingMessageEvent) => {
        const [party, monsters] = message.data;
        
        postMessage(bestiary.allocationsForParty(party, monsters));
        close();
    };
} 