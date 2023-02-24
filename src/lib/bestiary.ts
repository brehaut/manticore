import * as data from "./data";

import { costSystemForEdition, Edition, type ICostSystem } from './costs';
import type { Facet, FacetCounts } from "./data";


function monsterFromRecord(book: string) {
    return (record:data.MonsterRecord) => data.newMonster(record[0], 
                                                            record[1],
                                                            record[2],
                                                            record[3],
                                                            record[4],
                                                            book,
                                                            record[5]);
}


export class Bestiary {
    constructor(public monsters:data.Monster[], private costSystem: ICostSystem) {

    }
    
    public allSources() {
        return this.distinctValues((m) => m.book);
    }

    public allNames() {
        return this.distinctValues((m) => m.name);
    }
    
    public allSizes() {
        return this.distinctValues((m) => m.size);
    }

    public allKinds() {
        return this.distinctValues((m) => m.kind);
    }

    public allAttributes() {
        var attributes:string[] = [];
        
        this.monsters.forEach((m:data.Monster) => {
            m.attributes.forEach((a:string) => {
                if (attributes.indexOf(a) === -1) attributes.push(a);
            });
        });

        return attributes;
    }


    public featureCounts(party: data.IParty, filters: data.FilterFacets): FacetCounts {
        var descriptors:{countKey: any, monsterKey: keyof data.Monster, filterKey: any}[] = [
            {countKey: "source", monsterKey: "book", filterKey: "source"},
            {countKey: "size", monsterKey: "size", filterKey: "size"},
            {countKey: "kind", monsterKey: "kind", filterKey: "kind"},
            {countKey: "name", monsterKey: "name", filterKey: "name"},
            {countKey: "attributes", monsterKey: "attributes", filterKey: "attributes"},
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
            
            function inc (key:string) {
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
        ]);

        descriptors.map(applicableFilters).forEach(d => {
            counts.set(d.countKey as Facet, viableForFilters(d));
        })
        
        return counts;
    }
    
    public filteredBestiary(party: data.IParty,
                            filter: data.IPredicate<data.Monster>) {
        return this.monsters
            .filter(m => this.costSystem.isViableForParty(party, m))
            .filter(filter)
        ;
    }

    private distinctValues<T>(accessor:(m:data.Monster)=>T):T[] {
        var vals:T[] = [];

        this.monsters.forEach((m:data.Monster) => {
            var v = accessor(m);
            if (vals.indexOf(v) === -1) vals.push(v);
        });

        return vals;
    }
}


export function createBestiary(dataset:data.DataSet) {
    var catalog:data.Monster[] = [];
    for (var key in dataset) if (dataset.hasOwnProperty(key)) {
        catalog = catalog.concat(dataset[key].map(monsterFromRecord(key)));
    }

    return new Bestiary(catalog, costSystemForEdition(Edition.First));
}
