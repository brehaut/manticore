
import type * as data from "$lib/data";
import { allocationsForParty as deterministicAllocator }  from './allocator/deterministicAllocator';
import { allocationsForParty as randomAllocator }  from './allocator/randomAllocator';
import { GenerationProcess } from './allocator/index.js';
import { costSystemForEdition, Edition } from './costs';

interface ProcessingMessageEvent extends MessageEvent {
    data: {party: data.IParty, monsters:data.Monster[], edition: Edition, generationProcess: GenerationProcess };
}

onmessage = (message:ProcessingMessageEvent) => {
    const { party, monsters, edition, generationProcess } = message.data;
    
    const generator = generationProcess === GenerationProcess.Deterministic 
        ? deterministicAllocator 
        : randomAllocator;

    postMessage(generator(party, monsters, costSystemForEdition(edition)));
    close();
};

export {}