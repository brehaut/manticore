import type { ICostSystem, PricedMonster } from '$lib/costs/index';
import type { Allocation, Encounter, IParty, Monster } from "$lib/data";
import { groupBy, take } from '$lib/iter';
import { MonsterAllocation, priceMonsters } from "$lib/allocator";

function getWeightComparator<T>(getWeight: (v: T) => number): (a:T, b:T)=>number {
    return (a: T, b: T): number => {
        const aWeight = getWeight(a);
        const bWeight = getWeight(b);
        if (aWeight > bWeight) return 1;
        if (aWeight === bWeight) return 0;
        return -1;
    }
}

/** Wraps up a collection that forks and can be shrunk by some property of T  
 * 
 * setMaxWeight causes the collect to shrink down to only "contain" elements 
 */
class ShrinkableRandomAccessCollection<T> {
    static create<T>(buffer: ReadonlyArray<T>, getWeight: (a:T) => number): ShrinkableRandomAccessCollection<T> {
        return new (this)(buffer.slice().sort(getWeightComparator(getWeight)), getWeight, Number.MAX_SAFE_INTEGER);
    }

    private constructor (private readonly buffer: ReadonlyArray<T>, 
                         private readonly getWeight: (a:T) => number, 
                         private readonly max: number,
                         private readonly front:number = 0) {        
    }

    done(): boolean {
        return this.front >= this.buffer.length;
    }

    get size(): number {
        return this.buffer.length - this.front;
    }

    setMaxWeight(newMax: number) {
        const max = Math.min(newMax, this.max);
        let idx = this.front;
        while (idx >= this.buffer.length) {
            const weight = this.getWeight(this.buffer[idx]);
            if (weight <= this.max) break;
            idx += 1;
        }

        return new ShrinkableRandomAccessCollection(this.buffer, this.getWeight, max, idx);
    }

    fork(): ShrinkableRandomAccessCollection<T> {
        return new ShrinkableRandomAccessCollection(this.buffer, this.getWeight, this.max, this.front);
    }

    getRandom(): T {
        const idx = this.front + Math.floor(Math.random() * this.size);
        return this.buffer[idx];
    }
}


function consolidate(allocations: Allocation[]): Allocation[] {
    const grouped = Array.from(groupBy(allocations, (alloc) => alloc.monster.name + alloc.monster.count).values())
    const consolidated: Allocation[] = [];
    for (const group of grouped) {
        const exemplar = group[0];
        consolidated.push(new MonsterAllocation(
            exemplar.monster, 
            group.reduce((total, a) => a.num + total, 0)
        ));
    }
    return consolidated.sort((a,b)=>a.monster.name.localeCompare(b.monster.name));
}


/** Generates an infinte stream of random allocations
 *  
 * @param budget the budget to spend on monsters per allocation
 * @param monsters 
 */
function* allocate(budget: number, allMonsters:ShrinkableRandomAccessCollection<PricedMonster>): IterableIterator<Encounter[]> {
    let sinceLastSuccess = 0; // a circuit breaker
    while (sinceLastSuccess < 100) {
        const monsters = allMonsters.fork();
        const allocations:Allocation[] = [];
        let currentBudget = budget;
        while (currentBudget > 0 && !monsters.done()) {
            monsters.setMaxWeight(budget);
            const random = monsters.getRandom();
            allocations.push(new MonsterAllocation(random, random.count)); // TODO: more than one
            currentBudget = currentBudget - random.price;
        }
        if (currentBudget === 0) {
            yield [{
                allocations: consolidate(allocations),
                unspentPercentage: 0
            }]
            sinceLastSuccess = 0;
        }
    }
}


export function allocationsForParty(party:IParty, 
    selectedMonsters:ReadonlyArray<Monster>,
    costSystem: ICostSystem) {

    const priced = priceMonsters(selectedMonsters, costSystem, party);

    return Array.from(take(
        allocate(
            costSystem.partyBudget(party), 
            ShrinkableRandomAccessCollection.create(priced, (m) => m.price)
        ), 
        20
    ));
}