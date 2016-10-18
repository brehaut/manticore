/// <reference path="../../common/data.ts" />
/// <reference path="party-ui.tsx" />
/// <reference path="common.ts" />

module manticore.ui {
    "use strict";
    import Event = manticore.ui.Event;
    
    
    export class PartyView {        
        private worker = manticore.model.partyWorker(); 
        
        private partyComp: party.Party;

        public onChanged: Event<data.IParty>;

        constructor (private parent: HTMLElement) {
            this.onChanged = new Event<data.IParty>();
            this.createElements();
        }

        public getPartyInfo():data.IParty {
            return this.partyComp.getPartyInfo();
        }
        
        private createElements() {            
            this.partyComp = party.installParty(this.parent, this.worker);
        }
    }
}