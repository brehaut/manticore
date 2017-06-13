/// <reference path="../common/types.d.ts" />
/// <reference path="../common/shims.ts" />
/// <reference path="../common/data.ts" />
/// <reference path="../common/bestiary.ts" />
/// <reference path="../common/typed-workers.ts" />
/// <reference path="../common/messaging.ts" />
/// <reference path="../model/bestiary.ts" />

/// <reference path="ui.ts" />
/// <reference path="appcache.ts" />

module manticore {
    function awaitContentLoaded() {
        return new Promise((resolve, reject) => {
            document.addEventListener("DOMContentLoaded", ({}) => {
                manticore.appcache.handleReloads();
                resolve({});
            })
        });
    }
    
    // Some browsers dont support generators. This test is a little gross but it 
    // does allow us to switch implementations.
    const GENERATORS_AVAILABLE = (() => {
        try {
            eval ("(function*(){})");
            return true;
        }
        catch (e) {
            return false;
        }
    })();

    // There are two implementations of the processing worker script.
    // The main one use ES6 generators directly, while the fallback
    // uses Typescript's downlevel iteration compiler to produce an 
    // ES3/5 compatible script. The downside is that this is runs 
    // a little slower.
    function workerResource(): string {
        return `static/js/processing${GENERATORS_AVAILABLE ? "" : "-fallback"}.js`;
    }
        
    function allocate(party: data.IParty, monsters: data.Monster[]) {                
        const allocationWorker = workers.newWorker<[data.IParty, data.Monster[]], any>(workerResource());
        
        return new Promise(resolve => {
            allocationWorker.onmessage = (message) => {
                resolve(message.data);
            };
            allocationWorker.postMessage([party, monsters]);
        });
    }


    ui.initialize(
        document.getElementById("application")!,
        model.dataAccessWorker(),
        awaitContentLoaded()
            .then(_ => undefined)
            .catch(e => console.error("An error occured bootstrapping the application", e)),
        allocate
    );
}