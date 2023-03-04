import * as data from "./data";

import { costSystemForEdition, Edition, type ICostSystem } from './costs';
import type { Facet, FacetCounts } from "./data";


function monsterFromRecordForBook(book: string, srdReferences: data.SrdReferences) {
    return (record:data.MonsterRecord):data.Monster => {
        const name = record[0];
        return data.newMonster(
            name, 
            record[1],
            record[2],
            record[3],
            record[4],
            book,
            record[5],
            srdReferences[name.toLowerCase()]
        );
    }
}

const compareStrings = (a: string, b: string) => a.localeCompare(b)

function orderedComparisonFrom(terms: string[]): (a: string, b: string) => number {
    const priority = new Map(terms.map((t, idx) => [t, idx]));
    return (a: string, b: string) => {
        
        const aPriority = priority.get(a.toLocaleLowerCase());
        const bPriority = priority.get(b.toLocaleLowerCase());
        console.log(a,b,aPriority, bPriority)
        if (aPriority === undefined && bPriority === undefined) return compareStrings(a,b);

        if (aPriority === undefined) return 1;
        if (bPriority === undefined) return -1;

        if (aPriority < bPriority) return -1;
        if (aPriority > bPriority) return 1;

        return 0;
    }
}

const compareBook = orderedComparisonFrom(["13th age", "13 true ways", "bestiary", "bestiary 2"]);
const compareSize = orderedComparisonFrom(["weakling", "normal", "elite", "double strength", "large", "large elite", "triple strength", "huge"]);

export class Bestiary {
    constructor(public monsters:data.Monster[], private costSystem: ICostSystem) { }

    switchCostSystem(costSystem: ICostSystem): Bestiary {
        return new Bestiary(this.monsters, costSystem);
    }
    
    allSources(): string[] {
        return this.distinctValues((m) => m.book).sort(compareBook);
    }

    allNames(): string[] {
        return this.distinctValues((m) => m.name).sort(compareStrings);
    }
    
    allSizes(): data.MonsterSize[] {
        console.log("all sizes")
        return this.distinctValues((m) => m.size).sort(compareSize);
    }

    allKinds(): string[] {
        return this.distinctValues((m) => m.kind).sort(compareStrings);
    }

    allAttributes(): string[] {
        var attributes:string[] = [];
        
        this.monsters.forEach((m:data.Monster) => {
            m.attributes.forEach((a:string) => {
                if (attributes.indexOf(a) === -1) attributes.push(a);
            });
        });

        return attributes.sort(compareStrings);
    }

    allLevels(): number[] {
        return this.distinctValues(m => m.level).sort();
    }

    featureCounts(party: data.IParty, filters: data.FilterFacets): FacetCounts {
        var descriptors:{countKey: any, monsterKey: keyof data.Monster, filterKey: any}[] = [
            {countKey: "source", monsterKey: "book", filterKey: "source"},
            {countKey: "size", monsterKey: "size", filterKey: "size"},
            {countKey: "kind", monsterKey: "kind", filterKey: "kind"},
            {countKey: "name", monsterKey: "name", filterKey: "name"},
            {countKey: "attributes", monsterKey: "attributes", filterKey: "attributes"},
            {countKey: "level", monsterKey: "level", filterKey: "level"},
        ];
        
        function filtersExcluding(key: string):data.FilterFacets {
            const fs:data.FilterFacets = new Map();
            Array.from(filters.keys()).filter(k => k != key).forEach(k => fs.set(k, filters.get(k)!)); 
            return fs;
        }
        
        function applicableFilters(descriptor: {countKey: string, monsterKey: string, filterKey: string}) {
            return {
                countKey: descriptor.countKey,
                monsterKey: descriptor.monsterKey,
                predicate: data.predicateForFilters(filtersExcluding(descriptor.filterKey))
            };
        }
                    
        const viableForFilters = (descriptor: {countKey: string, monsterKey: string, predicate: (v: data.Monster)=>boolean}) => {
            const viable = this.filteredBestiary(party, descriptor.predicate);
            const countMap:Map<string, number> = new Map();
            
            function inc (key:string | number) {
                key = (typeof key === "number") ? key.toString() : key;
                const v:number = countMap.has(key) ? countMap.get(key)! : 0;
                countMap.set(key, v + 1);
            }
            
            for (var i = 0, j = viable.length; i < j; i++) {
                const m = viable[i];
                const attr:(string[] | string) = (m as any)[descriptor.monsterKey];
                if (attr instanceof Array) {
                    attr.forEach(inc);
                }
                else {
                    inc(attr);
                }                    
            }

            return countMap;
        };
        
        const counts:FacetCounts = new Map([
            ["source", new Map()],
            ["size", new Map()],
            ["kind", new Map()],
            ["attributes", new Map()],
            ["name", new Map()],
            ["level", new Map()],
        ]);

        descriptors.map(applicableFilters).forEach(d => {
            counts.set(d.countKey as Facet, viableForFilters(d));
        })
        
        return counts;
    }
    
    filteredBestiary(party: data.IParty,
                            filter: data.IPredicate<data.Monster>) {
        return this.monsters
            .filter(m => this.costSystem.isViableForParty(party, m))
            .filter(filter)
        ;
    }

    distinctValues<T>(accessor:(m:data.Monster)=>T):T[] {
        var vals:T[] = [];

        this.monsters.forEach((m:data.Monster) => {
            var v = accessor(m);
            if (vals.indexOf(v) === -1) vals.push(v);
        });

        return vals;
    }
}


function normaliseSrdNames(srdReferences: data.SrdReferences): data.SrdReferences {
    const normalised: data.SrdReferences = {};
    for (const [name, url] of Object.entries(srdReferences)) {
        normalised[name.toLowerCase()] = url;
    }
    return normalised;
}


export function createBestiary(dataset:data.DataSet, edition:Edition) {
    const books = dataset.books;
    const srdReferences = normaliseSrdNames(dataset.srdReferences);

    var catalog:data.Monster[] = [];
    for (const [bookName, book] of Object.entries(books)) {
        catalog = catalog.concat(book.map(monsterFromRecordForBook(bookName, srdReferences)));
    }

    return new Bestiary(catalog, costSystemForEdition(edition));
}
