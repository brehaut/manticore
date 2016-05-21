/// <reference path="../common/data.ts" />
/// <reference path="../common/messaging.ts" />
/// <reference path="../common/typed-workers.ts" /> 

module manticore.model {
    import dal = manticore.messaging.dataAccess;
    
    const PARTY_STATE_KEY = "state.party";
    
    function getOrDefault<T>(key: string, def:T):T {
        const val = window.localStorage.getItem(key);
        return val !== null ? JSON.parse(val) : def; 
    } 
    
    function partyWorkerInitialisation(worker: workers.ILightWeightWorkerContext<dal.PartyMessage, data.IParty>) {
        function postData() {
            worker.postMessage(getOrDefault(PARTY_STATE_KEY, { size: 4, level: 2 }));
        }
        
        window.addEventListener('storage', function(e) {
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
        
        // immediately post any stored data / default values but do so the next
        // go round the event loop to ensure that any listeners can be bound before the data arrives
        setTimeout(() => postData(), 0);
    }
    
    export function partyWorker () {
        return new workers.LightWeightWorker<dal.PartyMessage, data.IParty>(partyWorkerInitialisation);
    }
}