
import { PricedMonster, priceMonster, priceParty } from "./costs";
import * as data from "./data";
import * as bestiary from "./bestiary";
import * as iter from "./iter";

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


// This class wraps up the behaviour of walking along a buffer, and allowing an
// algorithm to fork off the index so that multiple branches can be traversed at 
// same time
class ForkingBufferCursor<T> {
    private index: number = 0;

    constructor (private readonly buffer: T[]) {

    }

    public done(): boolean {
        return this.index >= this.buffer.length;
    }

    public value(): T {
        return this.buffer[this.index];
    }

    public next(): void {
        this.index += 1;
    } 

    public forkAndNext(): ForkingBufferCursor<T> {
        const ptr = new ForkingBufferCursor<T>(this.buffer);
        ptr.index = this.index + 1;
        return ptr;
    }
}


function allocateMonsters(points:number, monstersArray:PricedMonster[]): data.GroupedEncounters {        
    const allowedUnspent = Math.min.apply(null, monstersArray.map((m) => m.price));    

    function* allocate(remainingPoints:number, 
                        monsters: ForkingBufferCursor<PricedMonster>,
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
        
        if (monsters.done()) return;

        // recursive behaviour follows
        // skip any solitary monsters if we have already encountered a solitary monster
        // TODO: clean up this logic to work for any kind on tracked constraint
        while (territorialSeen && monsterIsTerritorial(monsters.value())) {
            monsters.next();
            if (monsters.done()) return;
        }
        territorialSeen = territorialSeen || monsterIsTerritorial(monsters.value());

        const repeats = repeatMonster(remainingPoints, monsters.value());
        let cur = acc;

        // skip this monster
        yield* allocate(remainingPoints, monsters.forkAndNext(), cur, typeCount, territorialSeen); 

        // produce allocations for all the available numbers of this monster
        for (const alloc of repeats) {
            cur = acc.slice(); // copy array
            cur[cur.length] = alloc;

            yield* allocate(remainingPoints - alloc.cost, monsters.forkAndNext(), cur, 
                            typeCount + 1, territorialSeen);
        }
    }

    return groupMonsters(iter.take(allocate(points, new ForkingBufferCursor(monstersArray), []), 10000));
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
