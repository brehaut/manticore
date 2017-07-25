import * as allocator from "../common/allocator"; 
import * as data from "../common/data"; 

interface ProcessingMessageEvent extends MessageEvent {
    data: [data.IParty, data.Monster[]];
}

onmessage = (message:ProcessingMessageEvent) => {
    const [party, monsters] = message.data;
    
    postMessage(allocator.allocationsForParty(party, monsters));
    close();
};