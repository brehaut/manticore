/// <reference path="../common/bestiary.ts" />
/// <reference path="../common/data.ts" />
/// <reference path="../common/messaging.ts" />
/// <reference path="../common/shims.ts" />
/// <reference path="../common/reply.ts" />
/// <reference path="libs/storage.ts" />

/* the dataAccess worker wraps up network (and in future, indexdb) requests
 * to the raw bestiary data. 
 * 
 * For now querying etc still occurs within the UI window process.
 * (at least while Bestiary is still a class with methods)
 */

module manticore.workers.dataAccess {
    const PARTY_STATE_KEY = "state.party";

    import reply = manticore.reply.reply;


    function mergeWith<T>(merge:(a:T, b:T) => T) {
        return (os:{[index:string]: T}[]):{[index:string]: T} => {
            var acc:{[index:string]: T} = {};

            for (var i = 0, j = os.length; i < j; i++) {
                var o = os[i];
                for (var key in o) if (o.hasOwnProperty(key)) {
                    if (acc.hasOwnProperty(key)) {
                        acc[key] = merge(acc[key], o[key]);
                    }
                    else {
                        acc[key] = o[key];
                    }
                }
            }
            
            return acc;
        }
    }
   
    
       
    var dataset = Promise.all<string>([
        awaitAjax("../../static/data/bestiary.json"),
        awaitAjax("../../static/data/custom.json")
            .then<string>(resp => Promise.resolve<string>(resp), 
                          _ => Promise.resolve<string>("{}")
                         )
    ])
    // this looks wacky, but is due to the additional arguments of then conflicting
    // with the optional arguments parse
        .then<any[]>((texts:string[]) => texts.map((s) => JSON.parse(s))) 
        .then<any>(mergeWith<any[]>((a, b) => a.concat(b)))
    ;
    
    
    const storage = new manticore.storage.Storage();
    storage.onStorageChanged.register(data => {
        postMessage(messaging.dataAccess.partyDataMessage(JSON.parse(data.value)));
    });
    

    onmessage = (message) => {
        var data:messaging.IMessage<any> = message.data;

        if (messaging.dataAccess.isLinkLocalStorageMessage(data)) {
            storage.registerPort(message.ports[0]);
        }
        else if (messaging.dataAccess.isBestiaryMessage(data)) {
            if (messaging.dataAccess.isBestiaryGet(data)) {
                dataset.then(dataset => {
                    message.ports[0].postMessage(messaging.dataAccess.bestiaryDataMessage(dataset))
                });
            }
        }
        else if (messaging.dataAccess.isPartyMessage(data)) { 
            if (!storage.isLinked()) {
                console.log("local storage port not linked");
                return;
            }                       
            if (messaging.dataAccess.isPartyGet(data)) {
                storage.get(PARTY_STATE_KEY, '{"size": 4, "level": 2}')
                    .then(value => { 
                        postMessage(messaging.dataAccess.partyDataMessage(JSON.parse(value)));
                    })
                    ;
            }
            else if (messaging.dataAccess.isPartyPut(data)) {
                storage.put(PARTY_STATE_KEY, JSON.stringify(data.party))
                    .then(value => {
                        postMessage(messaging.dataAccess.partyDataMessage(JSON.parse(value))); // relay changes back to any listeners
                    })
                    ;
            }      
            else {
                // TODO: Post error
            }  
        }
    }
}