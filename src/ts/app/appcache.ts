/// <reference path="ui/strings.ts" />

// this module wraps up the application cache with a basic behaviour to allow users 
// to reload.
// much of the code is lifted from 
// http://www.html5rocks.com/en/tutorials/appcache/beginner/

module manticore.appcache {   
    function inPageConfirm(text, actionText) {
        const confirm = document.createElement("div");
        confirm.className = "C global-confirm";
        confirm.appendChild(document.createTextNode(text));
        const action = document.createElement("span");
        action.className = "action";
        action.appendChild(document.createTextNode(actionText));
        confirm.appendChild(action);
        const close = document.createElement("span");
        close.className = "close";
        close.appendChild(document.createTextNode("╳"));
        confirm.appendChild(close);

        document.body.appendChild(confirm);
        
        function remove() {
            if (confirm.parentNode) confirm.parentNode.removeChild(confirm);
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