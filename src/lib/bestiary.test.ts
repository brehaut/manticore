import { describe, it, expect } from 'vitest';
import { property, assert } from "jsverify";
import * as jsc from "jsverify";
(<any>global).it = it; // Needed to get jsverify to run

import { newMonster, type Allocation, type Encounter, type EncountersPerDay, type IParty, type Monster, type MonsterSize } from "./data";
import * as costs from "./costs";
import * as firstEdition from "./costs/first-edition";
import { allocationsForParty } from "./allocator/deterministicAllocator";

const partyLevel = jsc.integer(1, 10);
const partySize = jsc.integer(1, 10);
const party = jsc.record<IParty>({
  size: partySize,
  level: partyLevel,
  encountersPerDay: jsc.integer(4, 4) as jsc.Arbitrary<EncountersPerDay>
});

const size = jsc.elements<MonsterSize>(["normal", "large", "huge", "weakling", "elite", "double strength", "triple strength"]);
const kind = jsc.elements(["troop", "mook", "wrecker", "blocker", "archer", "caster", "leader", "spoiler", "stalker"]);
const monsterLevel = jsc.integer(0, 14);
const monster = jsc.record({
  name: jsc.nestring, 
  level: monsterLevel, 
  size: size,
  kind: kind,
  attributes: jsc.nearray(jsc.nestring),
  book: jsc.nestring,
  pageNumber: jsc.nat
}).smap(rec => newMonster(
  rec.name,
  rec.level,
  rec.size,
  rec.kind,
  rec.attributes,
  rec.book,
  rec.pageNumber,
  undefined
), v => v);
const monsters = jsc.array(monster);


function genEncounters(party:IParty, monsters:Monster[]) {
  return allocationsForParty(party, monsters, costs.costSystemForEdition(costs.Edition.First)).flat();
}



function uniqueAllocations(xs:Iterable<Encounter>): boolean {
    function mangle(as: Allocation[]) {
        return as.map(m => `[${m.num}x${m.monster.name}]`).sort((a,b)=>a.localeCompare(b)).join("-");
    }
    const seen = new Set<string>();
    for (const x of xs) {
        const jankyHash = mangle(x.allocations);
        if (seen.has(jankyHash)) return false;
        seen.add(jankyHash);
    }
    return true;
}

function minPrice(ms: costs.PricedMonster[]): costs.PricedMonster | undefined {
    let current = ms[0];
    if (!current) return;
    for (const m of ms) {
        if (m.price < current.price) current = m;        
    }
    return current;
}

describe("bestiary", () => {
  property("encounters are under party price", party, monsters, (party, monsters) => {
    const encounterGroups = genEncounters(party, monsters);
    return encounterGroups.every(encounter =>  encounter.allocations.map(alloc => alloc.cost).reduce((a,b)=>a + b, 0) <= firstEdition.priceParty(party.size));
  }); 

  property("allocations don't repeat", party, monsters, (party, monsters) => {
    const encounters = genEncounters(party, monsters);
    return uniqueAllocations(encounters);
  });

  property("unspent budget is not greater than the cheapest monster", party, monsters, (party, monsters) => {
    const pricedMonsters = monsters.flatMap(m => firstEdition.priceMonster(party.level, m)).filter(a => a) as costs.PricedMonster[]; 
    const cheapestMonster = minPrice(pricedMonsters);

    if (!cheapestMonster) return true;

    const partyBudget = firstEdition.priceParty(party.size);
    const encounterGroups = genEncounters(party, monsters);

    function calculateUnspentBudget(encounter: Encounter) {
      return partyBudget - encounter.allocations.map(alloc => alloc.cost).reduce((a,b)=>a+b, 0);
    }

    return encounterGroups.every(encounter => calculateUnspentBudget(encounter) < (cheapestMonster.price));
  });
});