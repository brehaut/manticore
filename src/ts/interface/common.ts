/// <reference path="../data.ts" />
/// <reference path="../strings.ts" />
/// <reference path="../dom.ts" />

module manticore.interface {
    import _ = strings._;
    
    export function cssClassName(text:string):string {
        return text.replace(/[^-a-zA-Z0-9]+/g, "-");
    }

    export function template(text:string, fill:{[index:string]:any}) { 
        return text.replace(/\{([a-zA-Z0-9]+?)\}/g, (_, key:string) => fill[key]);
    }


    export function sectionMarkup(nameKey:string, className:string, blurbKey: string, children:Node[]=[])
        :HTMLElement {
        var commonChildren = [
            DOM.header(
                null, 
                [
                    DOM.h1(null, [DOM.text(_(nameKey))]),
                    DOM.p(null, [DOM.text(_(blurbKey))])
                ]
            )
        ];
        
        return DOM.section(
            {
                "class": "clearfix " + className
            }, 
            Array.prototype.concat.apply(commonChildren, children)
        );
    }
    
    
    export interface IView {
        _appendTo(parent: HTMLElement):void;
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
}