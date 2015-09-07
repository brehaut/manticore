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
        
        "[filter summary]": "Filters are used to determine the set of available monsters to use when generating encounters. The more monsters, the more potential encounters. You do not need to select filters in every category. The number of viable monsters takes into account the filters and the party (above).",
        "[select monsters]": "Determine the subset of all known monsters to generate encounters with. You may either specific exact monstors, or use the filters to determine the set quickly.",
        "[selection mode]": "Choose filtering mode:",
        "[use filters]": "Smart filters",
        "[use pickers]": "Manual monster selection",
        "[pick monsters]": "Select specific monsters by name.",
        "[reset]": "Clear",
        
        "[results summary]": "Encounters that fit these criteria",
        
        

        "generate encounters": "Generate encounters",
        "more": "More…",
        "Number selected ": "Number of viable monsters selected: "
    }
    

    export function _(key:string, locale = Locale.EN):string {
        if (text[locale] === undefined || text[locale][key] === undefined) {
            return key;
        }

        return text[locale][key];
    }
}