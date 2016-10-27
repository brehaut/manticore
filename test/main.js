const jsc = require("jsverify");
const _ = require("lodash");
const fs = require("fs");

const property = jsc.property;
const assert = jsc.assert;

// code under test
eval(fs.readFileSync("static/js/processing.js", 'utf8'));

const partyLevel = jsc.integer(1, 10);
const partySize = jsc.integer(1, 10);
const party = jsc.record({
  size: partySize,
  level: partyLevel
});

const size = jsc.elements(["normal", "large", "huge"]);
const scale = jsc.elements(["mook", "normal", "large", "huge"]);
const monsterLevel = jsc.integer(0, 14);
const monster = jsc.record({
  name: jsc.nestring, 
  level: monsterLevel, 
  size: size,
  kind: jsc.nestring,
  scale: scale,
  attributes: jsc.nearray(jsc.nestring),
  book: jsc.nestring,
  pageNumber: jsc.nat
});
const monsters = jsc.array(monster);


function genEncounters(party, monsters) {
  return _.flatten(manticore.allocator.allocationsForParty(party, monsters));
}


describe("bestiary", () => {
  property("encounters are under party price", party, monsters, (party, monsters) => {
    const encounterGroups = genEncounters(party, monsters);
    return _.every(encounterGroups, encounter =>  _.sum(_.map(encounter, alloc => alloc.cost)) <= manticore.costs.priceParty(party.size));
  });

  property("allocations don't repeat", party, monsters, (party, monsters) => {
    const encounters = genEncounters(party, monsters);
    return _.uniqWith(encounters, _.isEqual).length === encounters.length;
  });

  property("unspent budget is not greater than the cheapest monster", party, monsters, (party, monsters) => {
    const pricedMonsters = _.compact(_.map(monsters, m => manticore.costs.priceMonster(party.level, m))); 
    const cheapestMonster = _.minBy(pricedMonsters, m => m.price);

    if (!cheapestMonster) return true;

    const partyBudget = manticore.costs.priceParty(party.size);
    const encounterGroups = genEncounters(party, monsters);

    function calculateUnspentBudget(encounter) {
      return partyBudget - _.sum(_.map(encounter, alloc => alloc.cost));
    }

    return _.every(encounterGroups, encounter => calculateUnspentBudget(encounter) < (cheapestMonster.price));
  });
});