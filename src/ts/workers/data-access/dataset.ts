/// <reference types="common" />
import common = manticore.common;
import data = manticore.common.data;
import messaging = manticore.common.messaging;
import reply = manticore.common.reply.reply;
import awaitAjax = manticore.common.shims.awaitAjax;

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


    
const dataset:Promise<data.DataSet> = Promise.all<string>([
    awaitAjax("../../static/data/bestiary.json"),
    awaitAjax("../../static/data/custom.json")
        .then<string, string>(resp => Promise.resolve<string>(resp), 
                                ({}) => Promise.resolve<string>("{}")
                                )
])
    .then(texts => texts.map((s) => JSON.parse(s) as data.DataSet)) 
    .then(mergeWith<data.MonsterRecord[]>((a, b) => a.concat(b)))
;


export class DataSet {
    constructor (private postMessage: (message: any)=>void) {
        
    }

    public handleMessage(message: messaging.dataAccess.BestiaryMessage, port?: MessagePort) {
        if (messaging.dataAccess.isBestiaryGet(message) && port) {
            dataset.then(dataset => {
                port.postMessage(messaging.dataAccess.bestiaryDataMessage(dataset))
            });
        }
    }
}
