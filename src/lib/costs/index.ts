import * as data from "../data";
import { FirstEdition } from "./first-edition";

export enum Edition {
    First = "First edition",
}

/** Cost systems implement a pricing model for monsters. 
 * This caters to the differing systems used by 1e and 2e 
 * of 13th Age.
 */

export interface ICostSystem {
    /** Calculates the how the size 'spend' a party has for a fair fight.      
     * @param party IParty instace
     */
    priceParty(party: data.IParty): number;

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
                            price:number,
                            count:number = 1) 
                            : PricedMonster { 
    // type hint to convince the compiler that we are going to mix in the new values                                  
    var mon = <PricedMonster>data.newMonster(name, level, size, kind, attributes, book, pageNumber);
    mon.price = price;
    return mon;    
}


export function costSystemForEdition(edition: Edition): ICostSystem {
    switch(edition) {
        case Edition.First:
            return FirstEdition;
    }
}