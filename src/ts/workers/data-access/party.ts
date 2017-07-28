
/// <reference types="common" />
import messaging = manticore.common.messaging;

import * as storage from "../libs/storage";

const PARTY_STATE_KEY = "state.party";

export class Party {
    constructor (private storage:storage.Storage, private postMessage: (message: any)=>void) {
        storage.onStorageChanged.register(data => {
            postMessage(messaging.dataAccess.partyDataMessage(JSON.parse(data.value)));
        });
    }

    public handleMessage(message: messaging.dataAccess.PartyMessage) {
        if (!this.storage.isLinked()) {
            console.log("local storage port not linked");
            return;
        }                       

        if (messaging.dataAccess.isPartyGet(message)) {
            this.storage.get(PARTY_STATE_KEY, '{"size": 4, "level": 2}')
                .then(value => { 
                    this.postMessage(messaging.dataAccess.partyDataMessage(JSON.parse(value)));
                })
                ;
        }
        else if (messaging.dataAccess.isPartyPut(message)) {
            this.storage.put(PARTY_STATE_KEY, JSON.stringify(message.party))
                .then(value => {
                    this.postMessage(messaging.dataAccess.partyDataMessage(JSON.parse(value))); // relay changes back to any listeners
                })
                ;
        }      
        else {
            // TODO: Post error
        }  
    }
}