 /// <reference types="common" />

/* the dataAccess worker wraps up network (and in future, indexdb) requests
 * to the raw bestiary data. 
 * 
 * For now querying etc still occurs within the UI window process.
 * (at least while Bestiary is still a class with methods)
 */
importScripts("common.js");

import reply = manticore.common.reply.reply; 
import messaging = manticore.common.messaging; 


import { DataSet } from "./data-access/dataset";
import { Party } from "./data-access/Party";
import { Storage } from "./libs/storage";
    
const dataset = new DataSet((m) => postMessage(m));
const storage = new Storage();


const party = new Party(storage, (message) => postMessage(message));


onmessage = (message) => {
    var data:messaging.IMessage<any> = message.data;

    if (messaging.dataAccess.isLinkLocalStorageMessage(data)) {
        storage.registerPort(message.ports[0]);
    }
    else if (messaging.dataAccess.isBestiaryMessage(data)) {
        dataset.handleMessage(data, message.ports[0]);
    }
    else if (messaging.dataAccess.isPartyMessage(data)) { 
        party.handleMessage(data);
    }
}
