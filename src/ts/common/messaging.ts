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
        export enum MessageTypes {
            Get = "localstorage.get",
            Put = "localstorage.put",
            Delete = "localstorage.delete",
            Data = "localstorage.data"
        }

        export interface LocalStorageGet extends IMessage<MessageTypes.Get> {
            key: string;
            defaultValue?: any;
        }
        export interface LocalStoragePut extends IMessage<MessageTypes.Put> {
            key: string;
            value: any;
        }
        export interface LocalStorageDelete extends IMessage<MessageTypes.Delete> {
            key: string;
        }
        export interface LocalStorageData extends IMessage<MessageTypes.Data> {
            key: string;
            value: any | null;
        }
        export type LocalStorageMessage = LocalStorageGet | LocalStoragePut | LocalStorageDelete | LocalStorageData;

        export function isLocalStorageMessage(msg:IMessage<any>): msg is LocalStorageMessage {
            switch (msg.messageKey) {
                case MessageTypes.Get: return true;
                case MessageTypes.Put: return true;
                case MessageTypes.Delete: return true;
                case MessageTypes.Data: return true;
                default: return false;
            }
        }
        export function isLocalStorageGetMessage(msg:IMessage<any>): msg is LocalStorageGet {
            return isLocalStorageMessage(msg) && msg.messageKey === MessageTypes.Get;
        }
        export function isLocalStoragePutMessage(msg:IMessage<any>): msg is LocalStoragePut {
            return isLocalStorageMessage(msg) && msg.messageKey === MessageTypes.Put;
        }
        export function isLocalStorageDeleteMessage(msg:IMessage<any>): msg is LocalStorageDelete {
            return isLocalStorageMessage(msg) && msg.messageKey === MessageTypes.Data;
        }
        export function isLocalStorageDataMessage(msg:IMessage<any>): msg is LocalStorageData {
            return isLocalStorageMessage(msg) && msg.messageKey === MessageTypes.Data;
        }

        export function getMessage(key: string, defaultValue?: any): LocalStorageMessage {
            return { messageKey:  MessageTypes.Get, key: key, defaultValue: defaultValue};
        }
        export function putMessage(key: string, value: any) : LocalStorageMessage {
            return { messageKey: MessageTypes.Put, key: key, value: value };
        }
        export function deleteMessage(key: string): LocalStorageMessage {
            return { messageKey: MessageTypes.Delete, key: key };
        }
        export function dataMessage(key: string, value: any | undefined) : LocalStorageMessage {
            return { messageKey: MessageTypes.Data, key: key, value: value };
        }
    }

    export module dataAccess {
        export enum LinkLocalStorageMessageTypes {
            Link = "link.localstorage"
        }

        export interface LinkLocalStorage extends IMessage<LinkLocalStorageMessageTypes.Link> { }
        export function linkLocalStorageMessage() : LinkLocalStorage {
            return { messageKey: LinkLocalStorageMessageTypes.Link };
        }
        export function isLinkLocalStorageMessage(msg: IMessage<any>) : msg is LinkLocalStorage {
            return msg.messageKey === LinkLocalStorageMessageTypes.Link;
        }


        // messages for accessing party information       
        export enum PartyMessageTypes {
            Get = "party.get",
            Put = "party.put",
            Data = "party.Data"
        } 
        
        export interface PartyGet extends IMessage<PartyMessageTypes.Get> { }
        export interface PartyPut extends IMessage<PartyMessageTypes.Put> {
            party: data.IParty;
        }
        export interface PartyData extends IMessage<PartyMessageTypes.Data> {
            party:  data.IParty;
        }
        export type PartyMessage = PartyGet | PartyPut | PartyData;      
        
        export function isPartyMessage(msg:IMessage<any>): msg is PartyMessage {
            return (msg.messageKey === PartyMessageTypes.Get || msg.messageKey === PartyMessageTypes.Put || msg.messageKey === PartyMessageTypes.Data);
        }
        
        export function isPartyGet(msg:PartyMessage): msg is PartyGet {
            return (msg.messageKey === PartyMessageTypes.Get);
        }
        
        export function isPartyPut(msg:PartyMessage): msg is PartyPut {
            return (msg.messageKey === PartyMessageTypes.Put);
        }
        
        export function isPartyData(msg:PartyMessage): msg is PartyData {
            return (msg.messageKey === PartyMessageTypes.Data);
        }
        
        export function partyPutMessage(data: data.IParty): PartyMessage {
            return {messageKey: PartyMessageTypes.Put, party: data};
        }
        
        export function partyGetMessage(): PartyMessage {
            return {messageKey:PartyMessageTypes.Get};
        }
        
        export function partyDataMessage(data: data.IParty): PartyMessage {
            return {messageKey: PartyMessageTypes.Data, party: data};
        }
        
        
        // messages for accessing bestiary data.               
        export enum BestiaryMessageTypes {
            Get = "bestiary.get",
            Data = "bestiary.data"
        }

        export interface BestiaryGet extends IMessage<BestiaryMessageTypes.Get> { };
        export interface BestiaryData extends IMessage<BestiaryMessageTypes.Data> {
            dataset: data.DataSet;
        }        
        export type BestiaryMessage = BestiaryGet | BestiaryData;
        
        export function isBestiaryMessage(msg:IMessage<any>): msg is BestiaryMessage {
            return (msg.messageKey === BestiaryMessageTypes.Get
                    || msg.messageKey === BestiaryMessageTypes.Data);
        }
        
        export function isBestiaryGet(msg:BestiaryMessage): msg is BestiaryGet {
            return (msg.messageKey === BestiaryMessageTypes.Get);
        } 
        
        export function isBestiaryData(msg:BestiaryMessage): msg is BestiaryData {
            return (msg.messageKey === BestiaryMessageTypes.Data);
        }         
        
        export function bestiaryGetMessage() : BestiaryMessage {
            return { messageKey: BestiaryMessageTypes.Get };
        }
        
        export function bestiaryDataMessage(data:data.DataSet) : BestiaryMessage {
            return { messageKey: BestiaryMessageTypes.Data, dataset: data };
        }


        export type DataAccessMessage = LinkLocalStorage | BestiaryMessage | PartyMessage;  
    }
}