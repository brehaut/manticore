/// <reference path="types.d.ts" />

module manticore.data {  
    export type MonsterSize = "normal" | "large" | "huge";
    export type MonsterScale = "mook" | MonsterSize;
    
                              // name, level, size,           , type ,  tags
    export type MonsterRecord = [string, number, data.MonsterSize, string, string[]];
    
    export type DataSet = {[index:string]: MonsterRecord[]};
    
    export interface Monster {
        name:string; 
        level:number; 
        size: MonsterSize;
        kind:string;
        scale: MonsterScale
        attributes: string[];
        book?:string;
    }
        
    export function newMonster(name:string, 
                               level:number,
                               size: MonsterSize,
                               kind: string,
                               attributes: string[],
                               book:string) 
                              : Monster {
        var scale:MonsterScale = (kind === "mook") ? "mook" : size;
        
        return {
            name: name,
            level: level,
            size: size,
            kind: kind,
            scale: scale,
            attributes: attributes,
            book: book,
        }                                    
    }


    export interface IParty {
        size: number;
        level: number;
    }


    export interface Allocation {
        monster: Monster;
        num:number;
    }

    export type Encounters = Allocation[][];
    export type GroupedEncounters = Encounters[];

    export interface Allocator {
        (party: IParty, monsters: Monster[]): Promise<GroupedEncounters>;
    }


    // general purpose predicates
    export interface IPredicate<T> {
        (v:T): boolean;
    }

    function anyPredicate<T>(preds:Array<(v:T)=>boolean>) {
        return (v:T) => {
            for (var i = 0, j = preds.length; i < j; i++) {
                if (preds[i](v)) return true;
            }
            return false;
        };
    }

    function allPredicate<T>(preds:Array<(v:T)=>boolean>) {
        return (v:T) => {
            for (var i = 0, j = preds.length; i < j; i++) {
                if (!preds[i](v)) return false;
            }
            return true;
        };
    }
    
    // monster specific predicate functions
    function sizePredicate(size:string) {
        return (m:Monster) => m.size === size;
    }

    function kindPredicate(kind:string) {
        return (m:Monster) => m.kind === kind;
    }

    function sourcePredicate(source:string) {
        return (m:Monster) => m.book === source;
    }

    function namePredicate(name:string) {
        return (m:Monster) => m.name === name;
    }
    
    function hasOneAttributePredicate(attributes:string[]) {
        return (m:Monster) => {
            var mattrs = m.attributes;
            for (var i = 0, j = attributes.length; i < j; i++) {
                if (mattrs.indexOf(attributes[i]) >= 0) return true;
            }
            return false;
        }
    }


    export function predicateForFilters(filters:{[index: string]:string[]}) {
        var predicates:Array<(m:data.Monster) => boolean> = [];

        for (var key in filters) if (filters.hasOwnProperty(key)) {
            var attributes = filters[key];
            if (attributes === null || attributes.length == 0) continue;

            if (key === "name") {
                predicates.push(anyPredicate<data.Monster>(
                    attributes.map(namePredicate)
                ));
            }
            else if (key === "size") {
                predicates.push(anyPredicate<data.Monster>(
                    attributes.map(sizePredicate)
                ));
            } 
            else if (key === "kind") {
                predicates.push(anyPredicate<data.Monster>(
                    attributes.map(kindPredicate)
                ));
            }
            else if (key === "sources") {
                predicates.push(anyPredicate<data.Monster>(
                    attributes.map(sourcePredicate)
                ));
            }
            else if (key === "attributes") {
                predicates.push(hasOneAttributePredicate(attributes));
            }            
            else {
                throw new Error("unknown filter type: " + key);
            }            
        }

        return allPredicate(predicates);
    }
}