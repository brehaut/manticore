/// <reference path="../../common/data.ts" />
/// <reference path="strings.ts" />

module manticore.ui {
    "use strict";    
    import _ = strings._;
    
    export function cssClassName(text:string):string {
        return text.replace(/[^-a-zA-Z0-9]+/g, "-");
    }

    export function template(text:string, fill:{[index:string]:any}) { 
        return text.replace(/\{([a-zA-Z0-9]+?)\}/g, (_:any, key:string) => fill[key]);
    }
}