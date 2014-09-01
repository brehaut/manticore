/// <reference path="types.d.ts" />
/// <reference path="shims.ts" />
/// <reference path="data.ts" />
/// <reference path="bestiary.ts" />
/// <reference path="interface.ts" />

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

    document.addEventListener("DOMContentLoaded", (e) => {
        var root = document.getElementById("application");

        var dataset = Promise.all<string>([
            awaitAjax("static/data/bestiary.json"),
            awaitAjax("static/data/custom.json")
                .then<string>(resp => Promise.of<string>(resp), 
                              _ => Promise.of<string>("{}")
                             )
        ])
        // this looks wacky, but is due to the additional arguments of map conflicting
        // with the optional arguments parse
            .map<any[]>((texts:string[]) => texts.map((s) => JSON.parse(s))) 
            .map<any>(mergeWith<any[]>((a, b) => a.concat(b)))
            .map<bestiary.Bestiary>(bestiary.createBestiary)
        ;

        interface.initialize(
            root,
            dataset,
            bestiary.allocationsForParty
        );
    });

    // appcache management
    function updateReady (e?) {
        applicationCache.swapCache();
    }
    
    applicationCache.addEventListener("updateready", updateReady);
    if(window.applicationCache.status === window.applicationCache.UPDATEREADY) {
        updateReady();
    }
}