/// <reference path="costs.ts" />
/// <reference path="data.ts" />
/// <reference path="bestiary.ts" />


module manticore.allocator {    
    import PricedMonster = costs.PricedMonster;
    
    import priceMonster = costs.priceMonster;
    import priceParty = costs.priceParty;

    const MAXIMUM_TYPES = 6;
    

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
    

    function monsterIsTerritorial(monster:data.Monster): boolean {
        return monster.attributes.indexOf("dragon") >= 0 || monster.name == "Vampire";
    }

    // allocateMonster is the core algorithm of this application.
    // TODO: this should respect caps on monster numbers 
    function repeatMonster(points: number, monster:PricedMonster):MonsterAllocation[] {
        var max = Math.floor(points / monster.price);
        if (monsterIsTerritorial(monster)) {
            max = Math.min(max, 1);
        }  

        var repeats:MonsterAllocation[] = [];
        for (var i = 1; i <= max; i++) {
            repeats[repeats.length] = new MonsterAllocation(monster, i);
        }
        return repeats;
    }




    function groupMonsters(allocations:data.Encounters): data.GroupedEncounters {
        function genKey(encounter:data.Allocation[]): string {
            return encounter.map(a => a.monster.name).join(";");
        }

        const groups:{[index:string]: data.Encounters} = {};

        for (let i = 0, j = allocations.length; i < j; i++) {
            const alloc = allocations[i];
            const key = genKey(alloc);
            if (!groups.hasOwnProperty(key)) groups[key] = [];
            groups[key].push(alloc);
        }

        const result:data.GroupedEncounters = [];
        for (let k in groups) if (groups.hasOwnProperty(k)) {
            result[result.length] = groups[k];
        }
        return result;
    }


    function allocateMonsters(points:number, monsters:PricedMonster[]): data.GroupedEncounters {
        const allAllocations:MonsterAllocation[][] = [];     
        const allowedUnspent = Math.min.apply(null, monsters.map((m) => m.price));

        function allocate(remainingPoints:number, 
                          monstersIdx:number, 
                          acc:MonsterAllocation[],
                          typeCount = 0,
                          territorialSeen=false) {

            // cap total generations at 10000; thats already getting silly
            if (allAllocations.length == 10000) throw { message: "Ran too long; Results truncated" };

            // if we are out of monsters, or have run out 
            // of points to spend, then stop recursing.
            // we check points first, so that we can add the allocation to 
            // the list even if we have run out of monsters
            if (remainingPoints < allowedUnspent) {
                if (acc.length > 0) allAllocations[allAllocations.length] = acc;
                return;
            }

            // if we have more than 7 types of monsters but we still havent
            // exhausted the budget, move on.
            if (typeCount > MAXIMUM_TYPES) return;
            
            if (monstersIdx >= monsters.length) return;

            // recursive behaviour follows
            // skip any solitary monsters if we have already encountered a solitary monster
            // TODO: clean up this logic to work for any kind on tracked constraint
            let monster = monsters[monstersIdx]
            while (territorialSeen && monsterIsTerritorial(monster)) {
                monstersIdx += 1;
                if (monstersIdx >= monsters.length) return;
                monster = monsters[monstersIdx];
            }
            territorialSeen = territorialSeen || monsterIsTerritorial(monster);

            const repeats = repeatMonster(remainingPoints, monster);
            let cur = acc;

            // skip this monster
            allocate(remainingPoints, monstersIdx + 1, cur, typeCount, territorialSeen); 

            // produce allocations for all the available numbers of this monster
            for (var i = 0, j = repeats.length; i < j; i++) {
                cur = acc.slice(); // copy array
                var alloc:MonsterAllocation = repeats[i];

                cur[cur.length] = alloc;

                allocate(remainingPoints - alloc.cost, monstersIdx + 1, cur, 
                         typeCount + 1, territorialSeen);
            }
        }

        try {
            allocate(points, 0, []);
        }
        catch (ex) { // produced more than the maximum number of results.
            // pass;  
        }

        return groupMonsters(allAllocations);
    }


    // public API:
    export function allocationsForParty(party:data.IParty, 
                                        selectedMonsters:data.Monster[]) {

        return allocateMonsters(priceParty(party.size),
                                selectedMonsters
                                    .map((m) => priceMonster(party.level, m))
                                    .filter((m) => m !== null) as PricedMonster[]
                               );
    }
}