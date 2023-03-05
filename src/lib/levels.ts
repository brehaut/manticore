import type { PricedMonster } from './costs/index';

export function isCareRequired(monster: PricedMonster, battleLeveL: number) {
    const delta = monster.level - battleLeveL;
    if (delta === 1) {
        if (monster.size !== "normal" && monster.size !== "weakling") {
            return true;
        }
        else if (monster.kind === "mook" && monster.count > 5) {
            return true;
        }
    } 
    else if (delta === 2) {
        if (monster.size === "normal") {
            return true;
        }
        else if (monster.kind === "mook" && monster.count === 5) {
            return true;
        }
    }

    return false;
}


export function isProbableMistake(monster: PricedMonster, battleLevel: number) {
    const delta = monster.level - battleLevel;
    if (delta === 2) {
        if (monster.size === "normal") {
            return true;
        }
        else if (monster.kind === "mook" && monster.count === 5) {
            return true;
        }
    }

    return false;
}

