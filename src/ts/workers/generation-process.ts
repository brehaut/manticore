/// <reference types="common" />
importScripts("common.js");

import data = manticore.common.data;
import allocator = manticore.common.allocator;


interface ProcessingMessageEvent extends MessageEvent {
    data: [data.IParty, data.Monster[]];
}

onmessage = (message:ProcessingMessageEvent) => {
    const [party, monsters] = message.data;
    
    postMessage(allocator.allocationsForParty(party, monsters));
    close();
};