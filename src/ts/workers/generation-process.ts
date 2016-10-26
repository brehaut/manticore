/// <reference path="../common/allocator.ts" />
/// <reference path="../common/data.ts" />

module manticore.workers.processing {
    interface ProcessingMessageEvent extends MessageEvent {
        data: [data.IParty, data.Monster[]];
    }
    
    onmessage = (message:ProcessingMessageEvent) => {
        const [party, monsters] = message.data;
        
        postMessage(allocator.allocationsForParty(party, monsters));
        close();
    };
} 