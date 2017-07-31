const jsc = require("jsverify");
const _ = require("lodash");
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const support = require("./support/require");

const property = jsc.property;
const assert = jsc.assert;

function loadfile(filename) {
    return JSON.parse(fs.readFileSync(filename, 'utf8'));
}

function ok(bool) {
    if (!bool) throw new Error();
}

function isString() {
    return (v) => {
        if ((typeof v) === "string" || v instanceof String) return;
        throw new Error(`${v} is not a string`);
    }
}

function isNumber() {
    return (v) => {
        if ((typeof v) === "number" || v instanceof number) return;
        throw new Error(`${v} is not a number`);
    }
}

function isTuple() {
    return (v) => {
        if (!(v instanceof Array)) throw new Error(`${v} is not an array`);
        if (v.length !== arguments.length) throw new Error(`${v} is not ${arguments.length} items long`);

        for (var i = 0; i < Math.min(v.length, arguments.length); i++) {
            !arguments[i](v[i]);
        }

        return true;
    };
}

const isEntry = isTuple( // ["Redscale flamewing", 12, "normal", "wrecker", ["kroma dragonic", "humanoid"], 0],
    isString(),
    isNumber(),
    isString(),
    isString(),
    (v) => v instanceof Array,
    isNumber() 
)

describe("format", () => {
    const data = loadfile("static/data/bestiary.json");

    it("toplevel datastructure is {[index:string]: Array}", 
        () => ok(typeof data === "object" && _.every(data, (v, k) => v instanceof Array))
    );
    
    it("book arrays contain only arrays",
        () => ok(_.values(data).every(book => book.every(record => record instanceof Array
                                                                && record.length == 5 || record.length == 6)))
    );

    it("entries are in appropriate format", 
        () => ok(_.values(data)
                  .every(book => book.every(isEntry)))
    );
});