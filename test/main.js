const jsc = require("jsverify");
const _ = require("lodash");
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const support = require("./support/require");

const property = jsc.property;
const assert = jsc.assert;

support.importScripts("common.js");
// code under test

const allocator = support.requireWithGlobal('./build/js/workers/libs/allocator');


const partyLevel = jsc.integer(1, 10);
const partySize = jsc.integer(1, 10);
const party = jsc.record({
  size: partySize,
  level: partyLevel
});

const size = jsc.elements(["normal", "large", "huge", "weakling", "elite", "double strength", "triple strength"]);
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
}).smap(rec => new manticore.common.data.newMonster(
  rec.name,
  rec.level,
  rec.size,
  rec.kind,
  rec.attributes,
  rec.book,
  rec.pageNumber
), v => v);
const monsters = jsc.array(monster);


function genEncounters(party, monsters) {
  return _.flatten(allocator.allocationsForParty(party, monsters));
}


const costs = manticore.common.costs;


describe("bestiary", () => {
  property("encounters are under party price", party, monsters, (party, monsters) => {
    const encounterGroups = genEncounters(party, monsters);
    return _.every(encounterGroups, encounter =>  _.sum(_.map(encounter, alloc => alloc.cost)) <= costs.priceParty(party.size));
  });

  property("allocations don't repeat", party, monsters, (party, monsters) => {
    const encounters = genEncounters(party, monsters);
    return _.uniqWith(encounters, _.isEqual).length === encounters.length;
  });

  property("unspent budget is not greater than the cheapest monster", party, monsters, (party, monsters) => {
    const pricedMonsters = _.compact(_.map(monsters, m => costs.priceMonster(party.level, m))); 
    const cheapestMonster = _.minBy(pricedMonsters, m => m.price);

    if (!cheapestMonster) return true;

    const partyBudget = costs.priceParty(party.size);
    const encounterGroups = genEncounters(party, monsters);

    function calculateUnspentBudget(encounter) {
      return partyBudget - _.sum(_.map(encounter, alloc => alloc.cost));
    }

    return _.every(encounterGroups, encounter => calculateUnspentBudget(encounter) < (cheapestMonster.price));
  });
});

