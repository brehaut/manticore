/// <reference path="../../../node_modules/typescript/lib/lib.webworker.d.ts" />
/// <reference path="../bestiary.ts" />
/// <reference path="../data.ts" />

module manticore.workers.processing {
    onmessage = (message) => {
        const [party, monsters]:[data.IParty, data.Monster[]] = message.data;
        
        postMessage(bestiary.allocationsForParty(party, monsters));
    };
} 