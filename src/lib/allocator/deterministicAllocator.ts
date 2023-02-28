import type { PricedMonster, ICostSystem } from "../costs";
import type * as data from "../data";
import * as iter from '../iter';
import { MonsterAllocation, priceMonsters } from './index';

const MAXIMUM_TYPES = 6;


// allocateMonster is the core algorithm of this application.
// TODO: this should respect caps on monster numbers 
function* repeatMonster(points: number, monster:PricedMonster):IterableIterator<MonsterAllocation> {
    if (monster.count > 1) { // Handle 2e mooks
        if (monster.price <= points) {
            yield new MonsterAllocation(monster, monster.count);
        }
        return;
    }

    var max = Math.floor(points / monster.price);

    for (var i = 1; i <= max; i++) {
        yield new MonsterAllocation(monster, i);
    }
}


function sortByUnspent(a:data.Encounter, b:data.Encounter): number {
    if (a.unspentPercentage > b.unspentPercentage) return 1;
    if (a.unspentPercentage === b.unspentPercentage) return 0;
    return 1;
}


function groupMonsters(allocations:Iterable<data.Encounter>): data.GroupedEncounters {        
    const groups = iter.groupBy(allocations, (encounter) => encounter.allocations.map(a => a.monster.name).join(";"));
    return Array.from(groups.values()).map(group => group.sort(sortByUnspent));
}


// This class wraps up the behaviour of walking along a buffer, and allowing an
// algorithm to fork off the index so that multiple branches can be traversed at 
// same time
class ForkingBufferCursor<T> {
    private index: number = 0;

    constructor (private readonly buffer: ReadonlyArray<T>) {

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

    public skipWhile(pred: (v:T)=>boolean): void {
        while (pred(this.value())) {
            this.next();
            if (this.done()) return;
        }
    }
}


function allocateMonsters(points:number, monstersArray:ReadonlyArray<PricedMonster>, allowedUnspent: number): data.GroupedEncounters {           
    function* allocate(remainingPoints:number, 
                        monsters: ForkingBufferCursor<PricedMonster>,
                        acc:MonsterAllocation[],
                        typeCount = 0): IterableIterator<data.Encounter> {
        // if we are out of monsters, or have run out 
        // of points to spend, then stop recursing.
        // we check points first, so that we can add the allocation to 
        // the list even if we have run out of monsters
        if (remainingPoints <= allowedUnspent) {
            if (acc.length > 0) {
                yield {unspentPercentage: (remainingPoints / points) * 100, allocations: acc};
            }
            return;
        }

        // if we have more than 7 types of monsters but we still havent
        // exhausted the budget, move on.
        if (typeCount > MAXIMUM_TYPES) return;
        
        if (monsters.done()) return;

        // recursive behaviour follows
        const repeats = repeatMonster(remainingPoints, monsters.value());
        let cur = acc;

        // skip this monster
        yield* allocate(remainingPoints, monsters.forkAndNext(), cur, typeCount); 

        // produce allocations for all the available numbers of this monster
        for (const alloc of repeats) {
            cur = acc.slice(); // copy array
            cur[cur.length] = alloc;

            yield* allocate(remainingPoints - alloc.cost, monsters.forkAndNext(), cur, 
                            typeCount + 1);
        }
    }

    return groupMonsters(iter.take(allocate(points, new ForkingBufferCursor(monstersArray), []), 10000));
}


// public API:
export function allocationsForParty(party:data.IParty, 
                                    selectedMonsters:data.Monster[],
                                    costSystem: ICostSystem) {

    const pricedMonsters = priceMonsters(selectedMonsters, costSystem, party); // priceMonster produces arrays of priced monsters

    return allocateMonsters(costSystem.partyBudget(party),
                            pricedMonsters,
                            costSystem.maximumUnspentBudget(pricedMonsters as PricedMonster[])
    );
}


