/// <reference path="data.ts" />

module Manticore.Interface {
    class UI {
        catalog: Array<Data.Monster>;
    }


    export function initialize(catalog, allocator) {
        console.log("Go");
    }
}