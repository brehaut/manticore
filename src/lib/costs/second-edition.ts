import { assertionFailure } from "$lib/assertion";
import { normalizeSize, type IParty, type Monster, type MonsterSize } from "$lib/data";
import { newPricedMonster, priceMonster, type PricedMonster } from ".";

type Equivalence = number;

type LevelDelta = -2 | -1 | 0 | 1 | 2;

function toDelta(partyLevel: number, monsterLevel: number): LevelDelta | undefined {
    const delta =  monsterLevel - partyLevel;
    if (delta < -2 || delta > 2) return undefined;
    return delta as LevelDelta;
}

const mookCountsByEquivalent = new Map<MonsterSize, number[]>([
    ["normal", [5]], 
    ["elite", [7, 8]], 
    ["large", [10]], 
    ["huge", [15]]
]);

// This table is a direct translation from the 2e draft (pg 176)
// The equivalents have been multiplied by 10 ensure everything 
// remains an integer.
const equivalents = new Map<LevelDelta, Map<MonsterSize, Equivalence>>([
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

/** Converts a mook into collection of priced monsters
 * 
 * Unlike other kinds of monster, mooks are priced different according to count, so 
 * this function produces a set of monsters rather than just one.
 * @param levelDelta 
 * @param monster 
 * @returns 
 */
export function mookEquivalents(levelDelta: LevelDelta, monster:Monster): PricedMonster[] {
    const pricing = equivalents.get(levelDelta)
        || assertionFailure(`Expected an mook equivalents at delta ${levelDelta}`);

    return Array.from(mookCountsByEquivalent.entries())
        .flatMap(([size, counts]) => 
            counts.map(count => priceMonster(monster, pricing.get(size)!, count)))
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
    const delta = toDelta(party.level, monster.level);
    if (delta === undefined) return [];

    if (monster.kind === "mook") {
        return mookEquivalents(delta, monster);
    }

    const cost = equivalents.get(delta)?.get(normalizeSize(monster.size)) 
        || assertionFailure(`Expected an equivalent cost for ${monster.size} at delta ${delta}`);

    // TODO: Weaklings

    return [priceMonster(monster, cost, 1)]; 
}
