const jsc = require("jsverify");
const _ = require("lodash");
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const property = jsc.property;
const assert = jsc.assert;

var importScripts = function(path) {
  vm.runInThisContext(fs.readFileSync("dist/static/js/" + path, 'utf8'), path);
};

importScripts("common.js");

var requireWithGlobal = function(script) {
  const global = {
    manticore: manticore,
    require: requireWithGlobal,
    exports: {}
  };
  
  const normalized = path.normalize(script + ".js")
  const dir = path.dirname(normalized);
  const filename = path.basename(normalized)
  process.chdir(dir)
  
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), global, filename);

  console.log(global.exports);
  return global.exports;
}

// code under test

const allocator = requireWithGlobal('./build/js/workers/libs/allocator');

console.log(allocator);

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
  return _.flatten(allocator.allocationsForParty(party, monsters));
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
