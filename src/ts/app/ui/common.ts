"use strict";    

import * as strings from "./strings";
    
export function cssClassName(text:string):string {
    return text.replace(/[^-a-zA-Z0-9]+/g, "-");
}
