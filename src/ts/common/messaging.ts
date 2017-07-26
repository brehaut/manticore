/// <reference path="data.ts" />

/* This module is a collection of types and type predicates for processing and sending messages
 * between worker-like objects.
 * 
 * because workers share jsonlike data, code cannot rely on type information to determine behaviour.
 * instead, these interfaces, types, and predicates use structural information to determine what to do.
 */

module manticore.common.messaging {
    export interface IMessage<TKey extends string> {
        messageKey: TKey;
    }

    export module localstorage {
        export type LocalStorageGetKeyT = "localstorage.get";
        const LocalStorageGetKey:LocalStorageGetKeyT = "localstorage.get";
        export type LocalStoragePutKeyT = "localstorage.put";
        const LocalStoragePutKey:LocalStoragePutKeyT = "localstorage.put";
        export type LocalStorageDeleteKeyT = "localstorage.delete";
        const LocalStorageDeleteKey:LocalStorageDeleteKeyT = "localstorage.delete"; 
        export type LocalStorageDataKeyT = "localstorage.data";
        const LocalStorageDataKey:LocalStorageDataKeyT = "localstorage.data";

        export interface LocalStorageGet extends IMessage<LocalStorageGetKeyT> {
            key: string;
            defaultValue?: any;
        }
        export interface LocalStoragePut extends IMessage<LocalStoragePutKeyT> {
            key: string;
            value: any;
        }
        export interface LocalStorageDelete extends IMessage<LocalStorageDeleteKeyT> {
            key: string;
        }
        export interface LocalStorageData extends IMessage<LocalStorageDataKeyT> {
            key: string;
            value: any | null;
        }
        export type LocalStorageMessage = LocalStorageGet | LocalStoragePut | LocalStorageDelete | LocalStorageData;

        export function isLocalStorageMessage(msg:IMessage<any>): msg is LocalStorageMessage {
            switch (msg.messageKey) {
                case LocalStorageGetKey: return true;
                case LocalStoragePutKey: return true;
                case LocalStorageDeleteKey: return true;
                case LocalStorageDataKey: return true;
                default: return false;
            }
        }
        export function isLocalStorageGetMessage(msg:IMessage<any>): msg is LocalStorageGet {
            return isLocalStorageMessage(msg) && msg.messageKey === LocalStorageGetKey;
        }
        export function isLocalStoragePutMessage(msg:IMessage<any>): msg is LocalStoragePut {
            return isLocalStorageMessage(msg) && msg.messageKey === LocalStoragePutKey;
        }
        export function isLocalStorageDeleteMessage(msg:IMessage<any>): msg is LocalStorageDelete {
            return isLocalStorageMessage(msg) && msg.messageKey === LocalStorageDeleteKey;
        }
        export function isLocalStorageDataMessage(msg:IMessage<any>): msg is LocalStorageData {
            return isLocalStorageMessage(msg) && msg.messageKey === LocalStorageDataKey;
        }

        export function getMessage(key: string, defaultValue?: any): LocalStorageMessage {
            return { messageKey: LocalStorageGetKey, key: key, defaultValue: defaultValue};
        }
        export function putMessage(key: string, value: any) : LocalStorageMessage {
            return { messageKey: LocalStoragePutKey, key: key, value: value };
        }
        export function deleteMessage(key: string): LocalStorageMessage {
            return { messageKey: LocalStorageDeleteKey, key: key };
        }
        export function dataMessage(key: string, value: any | undefined) : LocalStorageMessage {
            return { messageKey: LocalStorageDataKey, key: key, value: value };
        }
    }

    export module dataAccess {
        export interface LinkLocalStorage extends IMessage<"link.localstorage"> { }
        export function linkLocalStorageMessage() : LinkLocalStorage {
            return { messageKey: "link.localstorage" };
        }
        export function isLinkLocalStorageMessage(msg: IMessage<any>) : msg is LinkLocalStorage {
            return msg.messageKey === "link.localstorage";
        }

        // messages for accessing party information       
        export type PartyGetKeyT = "party.get";   
        const PartyGetKey: PartyGetKeyT = "party.get";    
        export type PartyPutKeyT = "party.put";   
        const PartyPutKey: PartyPutKeyT = "party.put"; 
        export type PartyDataKeyT = "party.data";
        const PartyDataKey: PartyDataKeyT = "party.data";
        
        export interface PartyGet extends IMessage<PartyGetKeyT> { }
        export interface PartyPut extends IMessage<PartyPutKeyT> {
            party: data.IParty;
        }
        export interface PartyData extends IMessage<PartyDataKeyT> {
            party:  data.IParty;
        }
        export type PartyMessage = PartyGet | PartyPut | PartyData;      
        
        export function isPartyMessage(msg:IMessage<any>): msg is PartyMessage {
            return (msg.messageKey === PartyGetKey || msg.messageKey === PartyPutKey || msg.messageKey === PartyDataKey);
        }
        
        export function isPartyGet(msg:PartyMessage): msg is PartyGet {
            return (msg.messageKey === PartyGetKey);
        }
        
        export function isPartyPut(msg:PartyMessage): msg is PartyPut {
            return (msg.messageKey === PartyPutKey);
        }
        
        export function isPartyData(msg:PartyMessage): msg is PartyData {
            return (msg.messageKey === PartyDataKey);
        }
        
        export function partyPutMessage(data: data.IParty): PartyMessage {
            return {messageKey: PartyPutKey, party: data};
        }
        
        export function partyGetMessage(): PartyMessage {
            return {messageKey:PartyGetKey};
        }
        
        export function partyDataMessage(data: data.IParty): PartyMessage {
            return {messageKey: PartyDataKey, party: data};
        }
        
        
        // messages for accessing bestiary data.
        export type BestiaryGetKeyT = "bestiary.get";
        const BestiaryGetKey: BestiaryGetKeyT = "bestiary.get";
        
        export type BestiaryDataKeyT = "bestiary.data";
        const BestiaryDataKey: BestiaryDataKeyT = "bestiary.data";
                
        export interface BestiaryGet extends IMessage<BestiaryGetKeyT> { };
        export interface BestiaryData extends IMessage<BestiaryDataKeyT> {
            dataset: data.DataSet;
        }        
        export type BestiaryMessage = BestiaryGet | BestiaryData;
        
        export function isBestiaryMessage(msg:IMessage<any>): msg is BestiaryMessage {
            return (msg.messageKey === BestiaryGetKey
                    || msg.messageKey === BestiaryDataKey);
        }
        
        export function isBestiaryGet(msg:BestiaryMessage): msg is BestiaryGet {
            return (msg.messageKey === BestiaryGetKey);
        } 
        
        export function isBestiaryData(msg:BestiaryMessage): msg is BestiaryData {
            return (msg.messageKey === BestiaryDataKey);
        }         
        
        export function bestiaryGetMessage() : BestiaryMessage {
            return { messageKey: BestiaryGetKey };
        }
        
        export function bestiaryDataMessage(data:data.DataSet) : BestiaryMessage {
            return { messageKey: BestiaryDataKey, dataset: data };
        }


        export type DataAccessMessage = LinkLocalStorage | BestiaryMessage | PartyMessage;  
    }
}