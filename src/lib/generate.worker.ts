
import type * as data from "$lib/data";
import {allocationsForParty} from './allocator';
import { costSystemForEdition, Edition } from './costs';

interface ProcessingMessageEvent extends MessageEvent {
    data: [data.IParty, data.Monster[]];
}

onmessage = (message:ProcessingMessageEvent) => {
    const [party, monsters] = message.data;
    
    postMessage(allocationsForParty(party, monsters, costSystemForEdition(Edition.First)));
    close();
};

export {}