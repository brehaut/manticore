import { describe, it, expect } from 'vitest';

import { battleLevel, monsterEquivalentParty } from "./second-edition";


describe("battleLevel spot tests", () => {
    const expectations = [[1,1],[4,4],[5,6],[7,8],[8,10],[10,12]];
    it("four encounters per day", () => {
        for (const [party, expected] of expectations) {
            expect(battleLevel(party, 4)).toBe(expected);
        }    
    });

    it("three encounters per day", () => {
        for (const [party, expected] of expectations) {
            expect(battleLevel(party, 3)).toBe(expected + 1);
        }    
    });
});

describe("monsterEquivalentParty", () => {
    it("party of 3 or less faces 3 or less monster equivalents.", () => {
        for (const size of [1,2,3]) {
            expect(monsterEquivalentParty({size, level: 1})).toEqual(size * 10);
        }
    });

    it("party of 4 or greater matches examples on page 174", () => {
        for (const [size, equivalents] of [[4,5], [5,7], [6, 9], [7, 11]]) {
            expect(monsterEquivalentParty({size, level: 1})).toEqual(equivalents * 10);
        }
    });
});

