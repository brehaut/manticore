import { _ } from "./ui/strings";

// this module wraps up the application cache with a basic behaviour to allow users 
// to reload.
// much of the code is lifted from 
// http://www.html5rocks.com/en/tutorials/appcache/beginner/

function probablyOnline() {
    if (!("onLine" in navigator)) return true;
    return navigator.onLine;
}


function inPageConfirm(text: string, actionText: string) {
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
        confirm.querySelector(".action")!.addEventListener("click", (e) => {
            remove();
            resolve(true);
        });
        confirm.querySelector(".close")!.addEventListener("click", remove);
    }); 
}

function updateReady (e?:Event) {
    if(applicationCache.status !== applicationCache.UPDATEREADY) return;
    applicationCache.swapCache();

    inPageConfirm(_`There is a new version of this app available.`, 
                  _`Reload?`)
        .then<any>(({}) => location.reload());
}

let checkForUpdates:number | undefined;
let lastCheckTime: number;
const CHECK_SPAN = 60 * 60 * 1000;// check hourly
function performCheck() {
    lastCheckTime = Date.now();

    try {
        applicationCache.update();
    }
    catch (e) {}
}

function startCheckCycle() {
    if(checkForUpdates) {
        clearInterval(checkForUpdates);
    }
    checkForUpdates = setInterval(performCheck, CHECK_SPAN); 
}

function handleOnline() {    
    const span = Date.now() - lastCheckTime; 
    if (span > CHECK_SPAN) {
        performCheck();
        startCheckCycle();
    }
    else {
        clearTimeout(checkForUpdates!);
        setTimeout(() => {
            performCheck();
            startCheckCycle();
        }, CHECK_SPAN - span);
    }
    
}

function handleOffline() {
    if(checkForUpdates) {
        clearInterval(checkForUpdates);
    }
}

export function handleReloads () {        
    applicationCache.addEventListener("updateready", updateReady);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    performCheck();
    startCheckCycle();

    updateReady();
}
