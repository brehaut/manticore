import * as reply from "../../common/reply";
import * as event from "../../common/event";
import * as messaging from "../../common/messaging";
import { localstorage } from "../../common/messaging";

export class Storage {
    private localStoragePort?: MessagePort;
    public onStorageChanged = new event.Event<{key: string, value: string}>();

    public registerPort(port: MessagePort) {
        if (this.localStoragePort) {
            this.localStoragePort.close();
        }

        this.localStoragePort = port;
        this.localStoragePort.onmessage = (message) => {
            const data = message.data;
            this.onStorageChanged.trigger({key: data.key, value: data.value});
        };
    }

    public isLinked(): boolean {
        return this.localStoragePort !== undefined;
    }

    private postMessage(message: localstorage.LocalStorageMessage): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.localStoragePort === undefined) {
                return reject("storage port is not registered");
            }

            const chan = new MessageChannel();          
            chan.port1.onmessage = (ev) => {
                resolve(ev.data.value);
            };   
            this.localStoragePort.postMessage(message, [chan.port2]);
        });
    }

    public get(key: string, defaultValue?: string): Promise<string> {
        return this.postMessage(localstorage.getMessage(key, defaultValue));
    }

    public put(key: string, value: string): Promise<string> {
        return this.postMessage(localstorage.putMessage(key, value));
    }

    public delete(key: string): Promise<string> {
        return this.postMessage(localstorage.deleteMessage(key));
    }
}    
