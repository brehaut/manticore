
import type * as data from "$lib/data";
import {allocationsForParty} from './allocator';
import { costSystemForEdition, Edition } from './costs';

interface ProcessingMessageEvent extends MessageEvent {
    data: [data.IParty, data.Monster[], Edition];
}

onmessage = (message:ProcessingMessageEvent) => {
    const [party, monsters, edition] = message.data;
    
    postMessage(allocationsForParty(party, monsters, costSystemForEdition(edition)));
    close();
};

export {}