/// <reference path="costs.ts" />
/// <reference path="data.ts" />
/// <reference path="bestiary.ts" />
/// <reference path="iter.ts" />


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
    function* repeatMonster(points: number, monster:PricedMonster):IterableIterator<MonsterAllocation> {
        var max = Math.floor(points / monster.price);
        if (monsterIsTerritorial(monster)) {
            max = Math.min(max, 1);
        }  

        for (var i = 1; i <= max; i++) {
            yield new MonsterAllocation(monster, i);
        }
    }




    function groupMonsters(allocations:Iterable<data.Allocation[]>): data.GroupedEncounters {        
        const groups = iter.groupBy(allocations, encounter => encounter.map(a => a.monster.name).join(";"));
        return Array.from(groups.values());
    }



    function allocateMonsters(points:number, monsters:PricedMonster[]): data.GroupedEncounters {        
        const allowedUnspent = Math.min.apply(null, monsters.map((m) => m.price));

        function* allocate(remainingPoints:number, 
                          monstersIdx:number, 
                          acc:MonsterAllocation[],
                          typeCount = 0,
                          territorialSeen=false): IterableIterator<MonsterAllocation[]> {
            // if we are out of monsters, or have run out 
            // of points to spend, then stop recursing.
            // we check points first, so that we can add the allocation to 
            // the list even if we have run out of monsters
            if (remainingPoints < allowedUnspent) {
                if (acc.length > 0) {
                    yield acc;
                }
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
            yield* allocate(remainingPoints, monstersIdx + 1, cur, typeCount, territorialSeen); 

            // produce allocations for all the available numbers of this monster
            for (const alloc of repeats) {
                cur = acc.slice(); // copy array
                cur[cur.length] = alloc;

                yield* allocate(remainingPoints - alloc.cost, monstersIdx + 1, cur, 
                                typeCount + 1, territorialSeen);
            }
        }

        return groupMonsters(iter.take(allocate(points, 0, []), 10000));
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