/// <reference path="../common/types.d.ts" />
/// <reference path="../common/data.ts" />
/// <reference path="../common/bestiary.ts" />
/// <reference path="../common/localstorage.ts" />
/// <reference path="ui/strings.ts" />
/// <reference path="ui/common.ts" />
/// <reference path="ui/application.tsx" />

module manticore.ui {
    import _ = strings._;

    // UI represents the whole UI, and is constructed of a series
    // of sub views.
    // UI also acts as the primary view controller for the application    
    class UI {                                
        constructor(private root: HTMLElement,
                    private allocator: data.Allocator, 
                    private dataAccessWorker: model.DataAccessWorker) {
            // punch in react replacement
            const reactContainer = document.createElement("div");
            installApplication(reactContainer, allocator, dataAccessWorker);
            root.appendChild(reactContainer);
            // end of react replacement
        }        
    }


    // testing utility
    function awaitDelay<T>(t: number) {
        return (v:T) => new Promise<T>((resolve, {}) => setTimeout(() => resolve(v), t));
    }


    // show a loading bezel while the json data is loading.
    function loadingUI(root: HTMLElement, promise: Promise<any>) { 
        const loading = document.createElement("div");
        loading.appendChild(document.createTextNode(_("Loading...")));
        root.appendChild(loading);

        promise.then(({}) => {
            root.removeChild(loading);
        });
    }
 
    // initialize is the public interface tothe UI; it will 
    // instantiate everythign and do the basic procedures requred
    // to get a UI going for the given data.
    export function initialize(root: HTMLElement, 
                               dataAccessWorker: model.DataAccessWorker,
                               ready:Promise<void>,
                               allocator: data.Allocator) {
        //bestiary = bestiary.then(awaitDelay(2000));
        dataAccessWorker.postMessage(messaging.dataAccess.linkLocalStorageMessage(), [localstorage.localStoragePort()]);

        ready
            .then<void>(({}) => {
                new UI(root, allocator, dataAccessWorker);
            })
            .catch((e) => {
                console.log(e); 
            })
        ; 

        loadingUI(root, ready);

    } 
}