module manticore.bestiary {
    // Monster records
    //
    // These two types simply represent records for monsters.
    // the PricedMonster has the additional information for
    // a monster priced relative to a party. 
    // 
    // a bit hideous to have a subclass, but the overall
    // nasty contained.

    class PricedMonster extends data.Monster {
        constructor(name:string,  
                    level:number, 
                    size:string,
                    kind:string,
                    attributes: string[],
                    book: string,
                    public price:number) { 
            super(name, level, size, kind, attributes, book);
        }
    }


    class MonsterAllocation implements data.Allocation {
        public cost: number;
        public monster: data.Monster;

        constructor (monster:PricedMonster, public num:number) { 
            this.cost = monster.price * num;
            this.monster = monster;
        }

        public toString() {
            return this.monster.toString() + " x" + this.num;
        }
    }
    

    // sizeFactor is the multiplier for relative cost by monster scale.
    // mooks are equal to 1/5 of an ordinary monster from level 3 up,
    // at level 1 they are equal to 1/3, and level 2 they are 1/4
    //
    // the size values for the non-mook sizes are calculated to result in
    // an even number for a mook at each size.
    function scaleFactor(scale: string, partyLevel: number) {
        var base = (3 * 4 * 5);

        if (scale === "mook") {
            if (partyLevel === 1) {
                return base / 3;
            }
            else if (partyLevel === 2) {
                return base / 4;
            }
            else {
                return base / 5;
            }
        }
        else if (scale === "normal") {
            return base;
        }
        else if (scale === "large") {
            return base * 2;
        }
        else if (scale === "huge") {
            return base * 3;
        }

        throw new Error("invalid scale '" + scale + "'");
    }


    function tierAdjustment(tier) {
        return ({
            adventurer: 0,
            champion: 1,
            epic: 2
        })[tier];
    }


    function levelToTier(level) {
        return [
            null, // adventurer level 0
            "adventurer",
            "adventurer",
            "adventurer",
            "adventurer",
            "champion",
            "champion",
            "champion",
            "epic",
            "epic",
            "epic"
        ][level];
    }


    function relativeCost(relativeLevel) {
        switch (relativeLevel) {
        case -2: return 2;
        case -1: return 3;
        case 0: return 4;
        case 1: return 6;
        case 2: return 8;
        case 3: return 12;
        case 4: return 16;
        default: return null;
        }
    }


    function adjustment(level:number):number {
        return tierAdjustment(levelToTier(level));
    }
    

    function relativeLevel(partyLevel:number, monsterLevel:number):number {
        var monsterAdjusted = monsterLevel - adjustment(partyLevel);
        return monsterAdjusted - partyLevel;
    }


    function monsterFromRecord(book) {
        return (record:any[]) => new data.Monster(record[0], 
                                                  record[1],
                                                  record[2],
                                                  record[3],
                                                  record[4],
                                                  book);
    }


    // this predicate repeats most of priceMonster in a different way
    // TODO: refactor
    function isViable(party:data.IParty, monster:data.Monster): boolean {
        var levelDiff = relativeLevel(party.level, monster.level);

        // monsters that are huge and 4 levels above the PCs are specifically
        // omitted from the table.
        if (levelDiff === 4 && monster.scale === "huge") return false;
        
        var cost = relativeCost(levelDiff);
        if (cost === null) return false;

        // if the monsters cost is greater than the whole party's total price
        // then it is not viable.
        if (cost * scaleFactor(monster.scale, party.level) > priceParty(party.size)) return false;
        
        return true;
    }


    function priceMonster(partyLevel:number, m:data.Monster) {
        var cost = relativeCost(relativeLevel(partyLevel, m.level));
        var multiplier = scaleFactor(m.scale, partyLevel);

        // some monster are not viable; ideally they should already be
        // filtered out but just incase.
        if (cost === null) return null;

        return new PricedMonster(m.name,
                                 m.level,
                                 m.size,
                                 m.kind,
                                 m.attributes,
                                 m.book,
                                 cost * multiplier);
    }


    function priceParty(characters:number) {
        return characters * scaleFactor("normal", 1) * relativeCost(0);
    }
    

    // allocateMonster is the core algorithm of this application.
    function repeatMonster(points, monster):MonsterAllocation[] {
        var max = Math.floor(points / monster.price); 
        var repeats = [];
        for (var i = 1; i <= max; i++) {
            repeats[repeats.length] = new MonsterAllocation(monster, i);
        }
        return repeats;
    }


    function allocateMonsters(points:number, monsters:PricedMonster[]) {
        var allAllocations = [];     
        var allowedUnspent = Math.min.apply(null, monsters.map((m) => m.price));
        
        var startT = +new Date();

        function allocate(remainingPoints:number, 
                          monstersIdx:number, 
                          acc:MonsterAllocation[]) {

            // cap runtime to 2 seconds
            if (+new Date() - startT >= 2000) throw { message: "Ran too long; Results truncated" };

            // if we are out of monsters, or have run out 
            // of points to spend, then stop recursing.
            // we check points first, so that we can add the allocation to 
            // the list even if we have run out of monsters
            if (remainingPoints < allowedUnspent) {
                if (acc.length > 0) allAllocations[allAllocations.length] = acc;
                return;
            }

            if (monstersIdx >= monsters.length) return;

            // recursive behaviour follows

            var repeats = repeatMonster(remainingPoints, monsters[monstersIdx]);
            var cur = acc;

            // skip this monster
            allocate(remainingPoints, monstersIdx + 1, cur); 

            // produce allocations for all the available numbers of this monster
            for (var i = 0, j = repeats.length; i < j; i++) {
                cur = acc.slice(); // copy array
                var alloc:MonsterAllocation = repeats[i];

                cur[cur.length] = alloc;

                allocate(remainingPoints - alloc.cost, monstersIdx + 1, cur);
            }
        }

        try {
            allocate(points, 0, []);
        }
        catch (ex) { // produced more than the maximum number of results.
            // pass;  
        }

        return allAllocations;
    }


    // public API:
    export function allocationsForParty(party:data.IParty, 
                                        selectedMonsters:data.Monster[]) {

        return allocateMonsters(priceParty(party.size),
                                selectedMonsters
                                .map((m) => priceMonster(party.level, m))
                                .filter((m) => m !== null)
                               );
    }


    export class Bestiary {
        constructor(public monsters:data.Monster[]) {

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
            var attributes = [];
            
            this.monsters.forEach((m:data.Monster) => {
                m.attributes.forEach((a:string) => {
                    if (attributes.indexOf(a) === -1) attributes.push(a);
                });
            });

            return attributes;
        }

        public featureCounts(party: data.IParty) {
            var viable = this.filteredBestiary(party, _ => true);

            var counts = {
                sources: {},
                sizes: {},
                kinds: {},
                attributes: {},
                names: {},
            };
            
            function inc (map, key:string) {
                var v = map.hasOwnProperty(key) ? map[key] : 0;
                map[key] = v + 1;
            }

            for (var i = 0, j = viable.length; i < j; i++) {
                var m = viable[i];
                inc(counts.sources, m.book);
                inc(counts.sizes, m.size);
                inc(counts.kinds, m.kind);
                inc(counts.names, m.name);
                m.attributes.forEach(a => {
                    inc(counts.attributes, a);
                });
            }

            return counts;
        }

        public filteredBestiary(party: data.IParty,
                                filter: data.IPredicate<data.Monster>) {
            return this.monsters
                .filter(m => isViable(party, m))
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


    export function createBestiary(dataset) {
        var catalog = [];
        for (var key in dataset) if (dataset.hasOwnProperty(key)) {
            catalog = catalog.concat(dataset[key].map(monsterFromRecord(key)));
        }

        return new Bestiary(catalog);
    }

}

