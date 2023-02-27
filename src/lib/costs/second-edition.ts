import { assertionFailure } from "$lib/assertion";
import { normalizeSize, type IParty, type Monster, type MonsterSize, type EncountersPerDay } from "$lib/data";
import { newPricedMonster, priceMonster, type ICostSystem, type PricedMonster } from ".";

/// TODO: Correct page numbers to final PDF when published

type Equivalence = number;

type LevelDelta = -2 | -1 | 0 | 1 | 2;

/** Implements the table on pg 175 of the 2e AlphaDraft v2 pdf
 * 
 * This calcuates the level for the battle (ie, median monster level)
 * based on the level of the party (and its corresponding tier) and the
 * number of encounters per "day"
 * 
 * @param partyLevel 
 * @returns level for a fair battle.
 */
export function battleLevel(partyLevel: number, numberOfBattles: EncountersPerDay): number {
    const perDayAdjusted = partyLevel + (numberOfBattles === 3 ? 1 : 0);

    if (partyLevel <= 4) { // Adventurer Tier
        return perDayAdjusted;
    }
    if (partyLevel <= 7) { // Champion Tier
        return perDayAdjusted + 1;
    }
    return perDayAdjusted + 2;
}

export function toDelta(partyLevel: number, monsterLevel: number, encountersPerDay: EncountersPerDay): LevelDelta | undefined {
    const delta =  monsterLevel - battleLevel(partyLevel, encountersPerDay);
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

    const costMultipler = weaklingCostMultiplier(monster);

    return Array.from(mookCountsByEquivalent.entries())
        .flatMap(([size, counts]) => 
            counts.map(count => priceMonster(monster, pricing.get(size)! * costMultipler, count)))
}

/** Calculate a monster's equivalent cost based on the rules from 13th Age.
 *  This is the core of the cost calculation in 2e.
 * 
 * @param party 
 * @param monster 
 * @returns a collection of monsters. For most monsters this will be a single item
 *          but for mooks, it will be a variety as they differ in cost by size
 */
export function priceMonsterAsEquivalents(party: IParty, monster:Monster): PricedMonster[] {
    const delta = toDelta(party.level, monster.level, party.encountersPerDay);
    if (delta === undefined) return [];

    if (monster.kind === "mook") {
        return mookEquivalents(delta, monster);
    }

    const cost = equivalents.get(delta)?.get(normalizeSize(monster.size)) 
        || assertionFailure(`Expected an equivalent cost for ${monster.size} at delta ${delta}`);

    const costMultipler = weaklingCostMultiplier(monster);

    return [priceMonster(monster, cost * costMultipler, 1)]; 
}

/* Weaklings cost half the price of the equivalent standard monster 
 */
function weaklingCostMultiplier(monster: Monster) {
    return monster.size === "weakling" ? 0.5 : 1;
}

/** Implements the party equivalents rules from page 174
 * 
 * @returns a budget for monsters expressed in the same scale as 
 *          monster costs, ie * 10.
 */
export function monsterEquivalentParty(party: IParty): number {
    if (party.size <= 3) return party.size * 10;
    return (3 + (party.size - 3) * 2) * 10;
}


export const SecondEdition:ICostSystem = {
    partyBudget: function (party: IParty): number {
        return monsterEquivalentParty(party);
    },
    priceMonster: function (party: IParty, monster: Monster): PricedMonster[] {
        return priceMonsterAsEquivalents(party, monster);
    },
    isViableForParty: function (party: IParty, monster: Monster): boolean {
        return toDelta(party.level, monster.level, party.encountersPerDay) !== undefined; // TODO: encounters per day
    }
}