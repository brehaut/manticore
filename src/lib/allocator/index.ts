import type { ICostSystem, PricedMonster } from '$lib/costs/index';
import type { Allocation, IParty, Monster } from '$lib/data';

export enum GenerationProcess {
    Deterministic,
    Random
}

export class MonsterAllocation implements Allocation {
    public cost: number;
    public monster: PricedMonster;

    constructor (monster:PricedMonster, public num:number) { 
        if (monster.count > 1) {
            this.cost = monster.price;
        }
        else {
            this.cost = monster.price * num;
        }
        this.monster = monster;
    }

    public toString() {
        return this.monster.toString() + " x" + this.num;
    }
}


export function priceMonsters(selectedMonsters: ReadonlyArray<Monster>, costSystem: ICostSystem, party: IParty):ReadonlyArray<PricedMonster> {
    return selectedMonsters
        .map((m) => costSystem.priceMonster(party, m))
        .flat(1);
}