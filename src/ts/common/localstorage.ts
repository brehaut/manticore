/// <reference path="messaging.ts" />

module manticore.localstorage {
    import ls = messaging.localstorage;

    export function localStoragePort() {
        const chan = new MessageChannel();
        const localPort = chan.port1;

        window.addEventListener('storage', function(e) {
            if (e.key) {
                localPort.postMessage(ls.dataMessage(e.key, e.newValue));
            }
        });             
        
        localPort.onmessage = (ev) => {
            const message = ev.data;
            if (!ls.isLocalStorageMessage(message)) return;

            if (ls.isLocalStorageGetMessage(message)) {
                localPort.postMessage(ls.dataMessage(message.key, localStorage.getItem(message.key)));
            }
            else if (ls.isLocalStoragePutMessage(message)) {
                localStorage.setItem(message.key, message.value);
                localPort.postMessage(ls.dataMessage(message.key, localStorage.getItem(message.key))); 
            }      
            else if (ls.isLocalStorageDeleteMessage(message)) {
                localStorage.removeItem(message.key);
                localPort.postMessage(ls.dataMessage(message.key, undefined));
            }  
        }
        
        return chan.port2
    }
}