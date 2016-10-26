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


describe("bestiary", () => {
  property("allocations are all under party price", party, monsters, (party, monsters) => {
    console.log(party, monsters, manticore.bestiary.allocationsForParty(party, monsters));
    return false
  });

  property("allocations don't repeat", () =>
    false
  );

  property("unspent budget is not greater than the cheapest monster", () => 
    false
  );
});