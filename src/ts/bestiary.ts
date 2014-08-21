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
                    attributes: Array<string>,
                    public price:number) { 
            super(name, level, size, kind, attributes);
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
            return this.monster.toString() + " x" + this.num + " (" + this.cost + ")";  
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


    function monsterFromRecord(record) {
        return new data.Monster(record[0], 
                                record[1],
                                record[2],
                                record[3],
                                record[4]);
    }


    function priceMonster(partyLevel:number, m:data.Monster) {
        var cost = relativeCost(relativeLevel(partyLevel, m.level));
        var multiplier = scaleFactor(m.scale, partyLevel);

        if (cost === null) return null;

        return new PricedMonster(m.name,
                                 m.level,
                                 m.size,
                                 m.kind,
                                 m.attributes,
                                 cost * multiplier);
    }

    function priceParty(characters:number) {
        return characters * scaleFactor("normal", 1) * relativeCost(0);
    }
    

    // allocateMonster is the core algorithm of this application.
    function repeatMonster(points, monster):Array<MonsterAllocation> {
        var max = Math.floor(points / monster.price); 
        var repeats = [];
        for (var i = 1; i <= max; i++) {
            repeats[repeats.length] = new MonsterAllocation(monster, i);
        }
        return repeats;
    }


    function allocateMonsters(points:number, monsters:Array<PricedMonster>) {
        var allAllocations = [];     
        var allowedUnspent = Math.min.apply(null, monsters.map((m) => m.price));

        function allocate(remainingPoints:number, 
                          monstersIdx:number, 
                          acc:Array<MonsterAllocation>) {

            // cap results at a maximum. 
            if (allAllocations.length >= 5000) throw { message: "Results truncated" };

            // if we are out of monsters, or have run out 
            // of points to spend, then stop recursing.
            // we check points first, so that we can add the allocation to 
            // the list even if we have run out of monsters
            if (remainingPoints < allowedUnspent) {
                allAllocations[allAllocations.length] = acc;
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
    export function allocationsForParty(characters:number, 
                                        partyLevel:number, 
                                        selectedMonsters:Array<data.Monster>) {

        return allocateMonsters(priceParty(characters),
                                selectedMonsters
                                .map((m) => priceMonster(partyLevel, m))
                                .filter((m) => m !== null)
                               );
    }


    export class Bestiary {
        constructor(public monsters:Array<data.Monster>) {

        }
        
    }

    export function createBestiary(dataset) {
        return new Bestiary(dataset.map(monsterFromRecord));
    }

}

