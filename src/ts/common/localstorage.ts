/// <reference path="messaging.ts" />
/// <reference path="reply.ts" />

module manticore.localstorage {
    import ls = messaging.localstorage;
    import reply = manticore.reply.reply;


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
                let val = localStorage.getItem(message.key)
                if (message.defaultValue !== undefined && val === null) {
                    val = message.defaultValue;
                }
                
                reply(localPort, ev, ls.dataMessage(message.key, val));
            }
            else if (ls.isLocalStoragePutMessage(message)) {
                localStorage.setItem(message.key, message.value);
                reply(localPort, ev, ls.dataMessage(message.key, localStorage.getItem(message.key))); 
            }      
            else if (ls.isLocalStorageDeleteMessage(message)) {
                localStorage.removeItem(message.key);
                reply(localPort, ev, ls.dataMessage(message.key, undefined));
            }  
        }
        
        return chan.port2
    }
}