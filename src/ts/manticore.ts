/// <reference path="types.d.ts" />
/// <reference path="shims.ts" />
/// <reference path="data.ts" />
/// <reference path="bestiary.ts" />
/// <reference path="interface.ts" />
/// <reference path="appcache.ts" />

module manticore {
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
   

    function awaitContentLoaded() {
        return new Promise((resolve, reject) => {
            document.addEventListener("DOMContentLoaded", _ => {
                manticore.appcache.handleReloads();
                resolve(null);
            })
        });
    }


    // Bootstrap application
    //
    // Immediately request the data. The interface waits on this and
    // (in parallel) DOMContentLoaded before it appears.
    // Not awaiting DOMContentLoaded to begin loading data ensures a faster
    // turn around.
   
    var dataset = Promise.all<string>([
        awaitAjax("static/data/bestiary.json"),
        awaitAjax("static/data/custom.json")
            .then<string>(resp => Promise.resolve<string>(resp), 
                          _ => Promise.resolve<string>("{}")
                         )
    ])
    // this looks wacky, but is due to the additional arguments of then conflicting
    // with the optional arguments parse
        .then<any[]>((texts:string[]) => texts.map((s) => JSON.parse(s))) 
        .then<any>(mergeWith<any[]>((a, b) => a.concat(b)))
        .then<bestiary.Bestiary>(bestiary.createBestiary)
    ;

    interface.initialize(
        document.getElementById("application"),
        Promise.all([dataset, awaitContentLoaded()])
            .then(all => all[0])
            .catch(e => console.error("An error occured bootstrapping the application", e)),
        bestiary.allocationsForParty
    );
}