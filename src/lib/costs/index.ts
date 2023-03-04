import { assertionFailure } from '$lib/assertion.js';
import * as data from "../data";
import { FirstEdition } from "./first-edition";
import { SecondEdition } from './second-edition.js';


export enum Edition {
    First = "First edition",
    Second = "Second edition"
}

/** Cost systems implement a pricing model for monsters. 
 * This caters to the differing systems used by 1e and 2e 
 * of 13th Age.
 * 
 * the rel
 */

export interface ICostSystem {
    /** Calculates the how the size budget a party has for a fair fight.      
     * @param party IParty instace
     */
    partyBudget(party: data.IParty): number;

    /** Calculates how much it will cost for a monster to join the encounter 
     * against a given party.
     * 
     * multiple PricedMonster instances may be returned as in situations 
     * where cost is varied by number.
     * 
     * @param party 
     * @param monster 
     */
    priceMonster(party: data.IParty, monster: data.Monster): PricedMonster[];

    /** Based on party level and monster details, determine if this monster is 
     * viable for an encounter at all.
     * 
     * Monsters that are too weak or two strong are not viable. 
     * 
     * This is a variation on the pricing algorithm.
     * 
     * @param party 
     * @param monster 
     */
    isViableForParty(party: data.IParty, monster: data.Monster): boolean;

    maximumUnspentBudget(pricedMonsters: PricedMonster[]): number;
}


// Monster records
export interface PricedMonster extends data.Monster {
    price: number;    
    count: number;
}   

export function newPricedMonster(name:string,  
                            level:number, 
                            size:data.MonsterSize,
                            kind:string,
                            attributes: string[],
                            book: string,
                            pageNumber: number,
                            srdReference: string,
                            price:number,
                            count:number = 1) 
                            : PricedMonster { 
    // type hint to convince the compiler that we are going to mix in the new values                                  
    var mon = <PricedMonster>data.newMonster(name, level, size, kind, attributes, book, pageNumber, srdReference);
    mon.price = price;
    mon.count = count;
    return mon;    
}

/** creates a new PricedMonster record from an existing Monster record
 * 
 * the price is the total price for the number of monsters in count. In 2e, 
 * price may differ by count. 
 */
export function priceMonster(monster: data.Monster, price: number, count: number) {
    var mon = <PricedMonster>data.newMonster(monster.name, monster.level, monster.size, monster.kind, monster.attributes, monster.book, monster.pageNumber, monster.srdUrl);
    mon.price = price;
    mon.count = count;
    return mon;
}

export function costSystemForEdition(edition: Edition): ICostSystem {
    switch(edition) {
        case Edition.First:
            return FirstEdition;
        case Edition.Second:
            return SecondEdition;
        default:
            assertionFailure(`Expected edition to a value in Edition enum, got "${edition}"`)
    }
}
