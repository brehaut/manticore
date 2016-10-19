/// <reference path="../../common/data.ts" />
/// <reference path="strings.ts" />

module manticore.ui {
    "use strict";    
    import _ = strings._;
    
    export function cssClassName(text:string):string {
        return text.replace(/[^-a-zA-Z0-9]+/g, "-");
    }

    export function template(text:string, fill:{[index:string]:any}) { 
        return text.replace(/\{([a-zA-Z0-9]+?)\}/g, (_, key:string) => fill[key]);
    }


    export class Event<T> {
        private handlers: Array<(v:T) => void>;
        constructor () {
            this.handlers = [];
        }

        public trigger(v:T) {
            for (var i = 0, j = this.handlers.length; i < j; i++) {
                this.handlers[i](v);
            }
        }

        public register(handler:(v:T) => void) {
            this.handlers.push(handler);
        }
    }
    
    
    export class Atom<T> {       
        public onChange:Event<T> = new Event<T>();
        
        constructor(private value:T) { }        
        
        public swap(f:(T) => T) {
            this.value = f(this.value);
            this.onChange.trigger(this.value);
        }
        
        public get():T {
            return this.value;
        }
    }
}