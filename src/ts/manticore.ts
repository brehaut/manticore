/// <reference path="bestiary.ts" />
/// <reference path="interface.ts" />

module Manticore {
    document.addEventListener("DOMContentLoaded", (e) => {
        Manticore.Interface.initialize(Manticore.Bestiary.monsters,
                                       Manticore.Bestiary.allocationsForParty);
    });
}