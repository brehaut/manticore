/// <reference path="../data.ts" />
/// <reference path="../messaging.ts" />
/// <reference path="../typed-workers.ts" /> 

module manticore.model {
    import dal = manticore.messaging.dataAccess;
    
    const PARTY_STATE_KEY = "state.party";
    
    function getOrDefault<T>(key: string, def:T):T {
        const val = (<any>window).localStorage.getItem(key);
        return val !== null ? JSON.parse(val) : def; 
    } 
    
    function partyWorkerInitialisation(worker: workers.ILightWeightWorkerContext<dal.PartyMessage, data.IParty>) {
        function postData() {
            worker.postMessage(getOrDefault(PARTY_STATE_KEY, { size: 4, level: 2 }));
        }
        
        (<any>window).addEventListener('storage', function(e) {
            postData();
        }) 
        
        worker.onmessage = (message) => {
            const data = message.data;
            
            if (dal.isPartyGet(data)) {
                postData();
            }
            else if (dal.isPartyPut(data)) {
                (<any>window).localStorage.setItem(PARTY_STATE_KEY, JSON.stringify(data.payload));
                worker.postMessage(data.payload); // relay changes back to any listeners
            }      
            else {
                // TODO: Post error
            }     
        }
    }
    
    export function partyWorker () {
        return new workers.LightWeightWorker<dal.PartyMessage, data.IParty>(partyWorkerInitialisation);
    }
}