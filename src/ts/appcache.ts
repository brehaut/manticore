/// <reference path="dom.ts" />
/// <reference path="strings.ts" />

// this module wraps up the application cache with a basic behaviour to allow users 
// to reload.
// much of the code is lifted from 
// http://www.html5rocks.com/en/tutorials/appcache/beginner/

module manticore.appcache {   
    function inPageConfirm(text, actionText) {
        var confirm = DOM.div({"class": "C global-confirm"}, [
            DOM.text(text),
            DOM.span({"class": "action"}, [DOM.text(actionText)]),
            DOM.span({"class": "close"}, [DOM.text("╳")])
        ]);        

        document.body.appendChild(confirm);
        
        function remove() {
            DOM.remove(confirm);
        }

        return new Promise<boolean>((resolve, reject) => {
            confirm.querySelector(".action").addEventListener("click", (e) => {
                remove();
                resolve(true);
            });
            confirm.querySelector(".close").addEventListener("click", remove);
        }); 
    }
    
    function updateReady (e?) {
        if(applicationCache.status !== applicationCache.UPDATEREADY) return;
        applicationCache.swapCache();

        inPageConfirm(ui.strings._("There is a new version of this app available. "), 
                      ui.strings._("Reload?"))
            .then<any>(_ => location.reload());
    }
    
    export function handleReloads () {        
        applicationCache.addEventListener("updateready", updateReady);
        
        try {
            applicationCache.update();
        }
        catch (e) {}
        
        updateReady();
    }
} 