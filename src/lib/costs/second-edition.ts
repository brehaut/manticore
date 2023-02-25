import type { IParty, Monster, MonsterSize } from "$lib/data";
import type { PricedMonster } from ".";

type Equivalence = number;

const mookCountsByEquivalent = new Map<MonsterSize, number[]>([
    ["normal", [5]], 
    ["elite", [7, 8]], 
    ["large", [10]], 
    ["huge", [15]]
]);

// This table is a direct translation from the 2e draft (pg 176)
// The equivalents have been multiplied by 10 ensure everything 
// remains an integer.
const equivalents = new Map<number, Map<MonsterSize, Equivalence>>([
    [-2, new Map([
        ["normal", 5],
        ["elite", 7],
        ["large", 10],
        ["huge", 15]
    ])],
    [-1, new Map([
        ["normal", 7],
        ["elite", 10],
        ["large", 15],
        ["huge", 20]
    ])],
    [0, new Map([
        ["normal", 10],
        ["elite", 15],
        ["large", 20],
        ["huge", 30]
    ])],
    [1, new Map([
        ["normal", 15],
        ["elite", 20],
        ["large", 30],
        ["huge", 40]
    ])],
    [2, new Map([
        ["normal", 20],
        ["elite", 30],
        ["large", 40],
        ["huge", 60]
    ])]
])  

export function mookEquivalents(levelDelta: number, monster:Monster): PricedMonster[] {
    return []; // TODO
}

/** Compute monster equivalents based on the rules from 13th Age.
 *  This is the core of the cost calculation in 2e.
 * 
 * @param party 
 * @param monster 
 * @returns a collection of monsters. For most monsters this will be a single item
 *          but for mooks, it will be a variety as they differ in cost by size
 */
export function monsterEquivalents(party: IParty, monster:Monster): PricedMonster[] {
    const delta = monster.level - party.level;

    if (monster.kind === "mook") {
        return mookEquivalents(delta, monster);
    }


    return []; // TODO
}