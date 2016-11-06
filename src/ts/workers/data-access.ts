/// <reference path="../common/bestiary.ts" />
/// <reference path="../common/data.ts" />
/// <reference path="../common/messaging.ts" />
/// <reference path="../common/shims.ts" />
/// <reference path="../common/reply.ts" />
/// <reference path="libs/storage.ts" />
/// <reference path="data-access/party.ts" />
/// <reference path="data-access/dataset.ts" />

/* the dataAccess worker wraps up network (and in future, indexdb) requests
 * to the raw bestiary data. 
 * 
 * For now querying etc still occurs within the UI window process.
 * (at least while Bestiary is still a class with methods)
 */

module manticore.workers.dataAccess {
    import reply = manticore.reply.reply; 

       
    const dataset = new manticore.workers.dataAccess.dataset.DataSet((m) => postMessage(m));
    const storage = new manticore.storage.Storage();
    

    const party = new manticore.workers.dataAccess.party.Party(storage, (message) => postMessage(message));


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
}