/// <reference path="strings.ts" />

module manticore.ui.text {
    export class ElidableText {
        private readonly prefixes: string[];

        constructor (prefixes: string[]) { 
            this.prefixes = prefixes.map(p => p.toLocaleLowerCase());
        }

        [Symbol.replace](string: string, replaceValue: string): string {
            for (const prefix of this.prefixes) {
                if (string.startsWith(prefix) && string[prefix.length] === " ") {
                    return string.slice(prefix.length);
                }
            }

            return string;
        }
    }


    export function normalizeText(text: string | null | undefined): string {
        if (text === undefined) return "";
        if (text === null) return "";

        const elidable = new ElidableText(strings.normalizationPrefixes());

        return text
            .trim()
            .toLocaleLowerCase()
            .replace(elidable, "")
            .trim();
    }
    

    export function compareText(a: string, b: string) {
        const an = normalizeText(a);
        const bn = normalizeText(b);

        if (an < bn) return -1;
        if (an > bn) return 1;    
        return 0;
    }
}