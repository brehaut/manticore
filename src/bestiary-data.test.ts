import { describe, it, expect } from 'vitest';
import * as fs from "fs";

type Pred = (v:unknown) => void;

function loadfile(filename:string) {
    return JSON.parse(fs.readFileSync(filename, 'utf8'));
}

function ok(bool:boolean) {
    if (!bool) throw new Error();
}

function isString():Pred {
    return (v:unknown) => {
        if ((typeof v) === "string" || v instanceof String) return;
        throw new Error(`${v} is not a string`);
    }
}

function isNumber():Pred {
    return (v:unknown) => {
        if ((typeof v) === "number" || v instanceof Number) return;
        throw new Error(`${v} is not a number`);
    }
}

function isPositiveNumber():Pred {
    return (v:unknown) => {
        if (((typeof v) === "number" || v instanceof Number)
            && (v as number) > 0) return;
        throw new Error(`${v} is not a positive number`);
    };
}

function isArray(pred:Pred):Pred {
    return (v:unknown) => {
        if (!(v instanceof Array)) throw new Error(`${v} is not an array`);
        
        for (var i = 0; i < Math.min(v.length, arguments.length); i++) {
            pred(v[i]);
        }
    }
}

function isTuple(...args: unknown[]):Pred {
    return (v:unknown) => {
        if (!(v instanceof Array)) throw new Error(`${v} is not an array`);
        if (v.length !== args.length) throw new Error(`${v} is not ${arguments.length} items long`);

        try {
            for (var i = 0; i < Math.min(v.length, arguments.length); i++) {
                arguments[i](v[i]);
            }
        }
        catch (e) {
            throw new Error(`Error in tuple ${JSON.stringify(v)}: ${(e as Error).message}`);
        }

        return true;
    };
}

function isInSet(setName:string, set:unknown[]) {    
    return (v:unknown) => {
        for (var i = 0; i < set.length; i++) {
            if (set[i] === v) return;
        }
        throw new Error(`${v} is not in set '${setName}'`);
    }
}

const isEntry = isTuple( // ["Redscale flamewing", 12, "normal", "wrecker", ["kroma dragonic", "humanoid"], 0],
    isString(),
    isNumber(),
    isInSet("sizes", ["weakling", "normal", "elite", "large", "huge", "double strength", "triple strength", "large elite"]),
    isInSet("type", ["troop", "mook", "wrecker", "blocker", "archer", "caster", "leader", "spoiler", "stalker"]),
    isArray(isString()),
    isNumber() 
)

function allEntries(data:any) {
    return (Object.values(data).flat());
}

describe("format", () => {
    const data = loadfile("static/data/bestiary.json");

    it("toplevel datastructure is {[index:string]: Array}", 
        () => ok(typeof data === "object" && Object.values(data).every(v => v instanceof Array))
    );
    
    it("book arrays contain only arrays",
        () => ok(allEntries(data).every(record => record instanceof Array
                                                    && (record.length == 5 || record.length == 6)))
    );

    it("entries are in appropriate format", 
        () => ok(Object.values(data)
                  .every((book:any) => book.every(isEntry)))
    );
});
