/// <reference path="data.ts" />

module manticore.messaging {
    export module dataAccess {
        export interface PartyPut {
            party: data.IParty
        }
       
        export type PartyMessage = "Party.Get" | PartyPut;
        
        export function isPartyGet(msg:PartyMessage): msg is "Party.Get" {
            if (msg === "Party.Get") return true;
            return false;
        }
        
        export function isPartyPut(msg:PartyMessage): msg is PartyPut {
            if (msg instanceof Object && msg.hasOwnProperty("party")) return true;
        }
    }
}