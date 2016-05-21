/// <reference path="../../../node_modules/typescript/lib/lib.webworker.d.ts" />
/// <reference path="../bestiary.ts" />
/// <reference path="../data.ts" />
/// <reference path="../messaging.ts" />
/// <reference path="../shims.ts" />

/* the dataAccess worker wraps up network (and in future, indexdb) requests
 * to the raw bestiary data. 
 * 
 * For now querying etc still occurs within the UI window process.
 * (at least while Bestiary is still a class with methods)
 */

module manticore.workers.dataAccess {
    interface DataAccessMessageEvent extends MessageEvent {
        data: messaging.dataAccess.BestiaryMessage;
    }
    
    
    function mergeWith<T>(merge?:(a:T, b:T) => T) {
        return (os:{[index:string]: T}[]):{[index:string]: T} => {
            var acc:{[index:string]: T} = {};
            merge = merge

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
    
    
    
    
    onmessage = (message) => {
        var data = message.data;     
    }
}