module manticore.ui.strings {
    "use strict";    

    export enum Locale {
        EN
    }

    interface Strings {        
        [index: string]: string;
    }

    interface Normalizations {
        prefixes?: string[];
    }

    interface LocaleInfo {
        strings: Strings;

        normalization: Normalizations;
    }

    const text = new Map<Locale, LocaleInfo>();

    text.set(Locale.EN, {
        strings: {
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
            "Number selected ": "Number of viable monsters selected: ",
            "[{n} variations.]": "{n} variations.",
        },

        normalization: {
            prefixes: ["the", "a"]
        }
    });
    
    export function _(key:string, locale = Locale.EN):string {
        if (text === undefined) return key;
        if (!text.has(locale)) return key;

        const info = text.get(locale)!;
        if(info.strings[key] === undefined) return key;
        
        return info.strings[key];
    }

    export function normalizationPrefixes(locale = Locale.EN): string[] {
        if (text === undefined) return [];
        if (!text.has(locale)) return [];

        const info = text.get(locale)!;
        return info.normalization.prefixes || [];
    }
}