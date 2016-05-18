/// <reference path="data.ts" />

/* This module is a collection of types and type predicates for processing and sending messages
 * between worker-like objects.
 * 
 * because workers share jsonlike data, code cannot rely on type information to determine behaviour.
 * instead, these interfaces, types, and predicates use structural information to determine what to do.
 */

module manticore.messaging {   
    export interface IMessage<TKey extends string, TPayload> {
        key: TKey;
        payload: TPayload;
    }
   
    
    export module dataAccess {
        // messages for accessing party information       
        export type PartyGet = IMessage<"Party.Get", void>;
        export type PartyPut = IMessage<"Party.Put", data.IParty>;
        export type PartyMessage = PartyGet | PartyPut;      
        
        export function isPartyMessage(msg:IMessage<any, any>): msg is PartyMessage {
            return (msg.key === "Party.Get" || msg.key === "Party.Put");
        }
        
        export function isPartyGet(msg:PartyMessage): msg is PartyGet {
            return (msg.key === "Party.Get");
        }
        
        export function isPartyPut(msg:PartyMessage): msg is PartyPut {
            return (msg.key === "Party.Put");
        }
        
        export function partyPutMessage(data: data.IParty): PartyMessage {
            return {key: "Party.Put", payload: data};
        }
        
        export function partyGetMessage(): PartyMessage {
            return {key: "Party.Get", payload: undefined};
        }
        
        // messages for accessing bestiary data.
        export type BestiaryGet = IMessage<"Bestiary.Get", {getResource: "standard" | "custom" }>;
        
        export type BestiaryMessage = BestiaryGet;
        
        export function isBestiaryMessage(msg:IMessage<any, any>): msg is BestiaryMessage {
            return (msg.key === "Bestiary.Get");
        }
        
        export function isBestiaryGet(msg:BestiaryMessage): msg is BestiaryGet {
            return (msg.key === "Bestiary.Get");
        } 
    }
}