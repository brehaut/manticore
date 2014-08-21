/// <reference path="types.d.ts" />
/// <reference path="shims.ts" />
/// <reference path="data.ts" />
/// <reference path="bestiary.ts" />
/// <reference path="interface.ts" />

module manticore {
    document.addEventListener("DOMContentLoaded", (e) => {
        var root = document.getElementById("application");

        var dataset = awaitAjax("static/data/bestiary.json")
            .map<any>(JSON.parse)
            .map<bestiary.Bestiary>(bestiary.createBestiary)
        ;

        interface.initialize(
            root,
            dataset,
            bestiary.allocationsForParty
        );
    });
}