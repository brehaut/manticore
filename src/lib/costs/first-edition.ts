import type * as data from "../data";

// the following two functions are used by sizeFactor to determine the 

import { newPricedMonster, type ICostSystem, type PricedMonster } from ".";

export type Tier = "adventurer" | "champion" | "epic";

// base scale cost of a given monster 
function applySize(size: data.MonsterSizeBase, base: number): number {
    if (size === "normal") {
        return base;
    }
    else if (size === "large") {
        return base * 2;
    }
    else if (size === "huge") {
        return base * 3;
    }
    else if (size === "elite") {
        return base * 1.5;
    }
    else if (size === "weakling") {
        return base * 0.5;
    }

    throw new Error("invalid size '" + size + "'");
}

function applyThreat(threat: data.MonsterThreat, base: number, partyLevel: number): number {
    if (threat === "mook") {
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
    else if (threat === "weakling") {
        return base * 0.5;
    }
    else if (threat === "elite") {
        return base * 1.5;
    }

    return base;
}
// scaleFactor is the multiplier for relative cost by monster scale.
// mooks are equal to 1/5 of an ordinary monster from level 3 up,
// at level 1 they are equal to 1/3, and level 2 they are 1/4
//
// the size values for the non-mook sizes are calculated to result in
// an even number for a mook at each size.
function scaleFactor([scale, threat]: data.MonsterScale, partyLevel: number): number {
    const base = (3 * 4 * 5);

    return applyThreat(threat, applySize(scale, base), partyLevel);
}


function tierAdjustment(tier:Tier): number {
    switch (tier) {
        case "adventurer": return 0;
        case "champion": return 1;
        case "epic": return 2;
        default:
            throw new Error(`Unknown tier '${tier}'`);
    }        
}


function levelToTier(level:number):Tier {
    return <Tier>[
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


function relativeCost(relativeLevel: number): number | undefined {
    switch (relativeLevel) {
        case -2: return 2;
        case -1: return 3;
        case 0: return 4;
        case 1: return 6;
        case 2: return 8;
        case 3: return 12;
        case 4: return 16;
        default: return undefined;
    }
}


function adjustment(level:number):number {
    return tierAdjustment(levelToTier(level));
}


function relativeLevel(partyLevel:number, monsterLevel:number):number {
    var monsterAdjusted = monsterLevel - adjustment(partyLevel);
    return monsterAdjusted - partyLevel;
}




// this predicate repeats most of priceMonster in a different way
// TODO: refactor
function isViable(party:data.IParty, monster:data.Monster): boolean {
    var levelDiff = relativeLevel(party.level, monster.level);

    // monsters that are huge and 4 levels above the PCs are specifically
    // omitted from the table.
    if (levelDiff === 4 && monster.scale[0] === "huge") return false;
    
    var cost = relativeCost(levelDiff);
    if (cost === undefined) return false;

    // if the monsters cost is greater than the whole party's total price
    // then it is not viable.
    if (cost * scaleFactor(monster.scale, party.level) > priceParty(party.size)) return false;
    
    return true;
}


export function priceMonster(partyLevel:number, m:data.Monster): PricedMonster[] {
    var cost = relativeCost(relativeLevel(partyLevel, m.level));
    var multiplier = scaleFactor(m.scale, partyLevel);

    // some monster are not viable; ideally they should already be
    // filtered out but just incase.
    if (cost === undefined) return [];

    return [newPricedMonster(m.name,
                            m.level,
                            m.size,
                            m.kind,
                            m.attributes,
                            m.book,
                            m.pageNumber,
                            cost * multiplier)];
}


export function priceParty(characters:number): number {
    return characters * scaleFactor(["normal", "normal"], 1) * (relativeCost(0)!);
}


export const FirstEdition:ICostSystem = {
    partyBudget: function (party: data.IParty): number {
        return priceParty(party.size);
    },
    priceMonster: function (party: data.IParty, monster: data.Monster): PricedMonster[] {
        return priceMonster(party.level, monster);
    },
    isViableForParty: function (party: data.IParty, monster: data.Monster): boolean {
        return isViable(party, monster);
    }
}