module manticore.interface.strings {
    export enum Locale {
        EN
    }

    interface Strings {
        [index: string]: string
    }

    var text:{[index: number]:Strings} = [];

    text[Locale.EN] = {
        "Party size": "Party size",
        "Party level": "Party level",
        "[party summary]": "Set the size and level of the party. This is used to determine the cost of individual monsters, and set the size of the encounter.",
        "[filter summary]": "Define rules for how monsters are selected from the bestiary.",
        "[results summary]": "Encounters that fit these criteria",

        "generate encounters": "Generate encounters",
        "more": "More…"
    }
    

    export function _(key:string, locale = Locale.EN):string {
        if (text[locale] === undefined || text[locale][key] === undefined) {
            return key;
        }

        return text[locale][key];
    }
}