export type MonsterSizeBase = "normal" | "large" | "huge";
export type MonsterSize = MonsterSizeBase  | "weakling" | "elite" | "double strength" | "triple strength" | "large elite";
export type MonsterThreat = "normal" | "mook"  | "weakling" | "elite";
export type MonsterScale = [MonsterSizeBase, MonsterThreat];

                            // name,   level,  size,        type,   tags,     page number
export type MonsterRecord = [string, number, MonsterSize, string, string[], number];

export type DataSet = {[index:string]: MonsterRecord[]};

export type Tier = "adventurer" | "champion" | "epic";

export interface Monster {
    readonly name:string; 
    readonly level:number; 
    readonly size: MonsterSize;
    readonly kind:string;
    readonly scale: MonsterScale
    readonly attributes: string[];
    readonly book:string;
    readonly pageNumber: number;
}

function normalizeThreat(size: MonsterSize, kind: string): MonsterThreat {
    if (kind === "mook") return "mook";
    if (size === "weakling") return "weakling";
    if (size === "elite" || size === "large elite") return "elite";
    return "normal";
}

function normalizeSize(size: MonsterSize): MonsterSizeBase {
    switch (size) {
        case "double strength": 
        case "large elite": 
            return "large";
        case "triple strength":
            return "huge";
        case "weakling":
        case "elite":
            return "normal";
        default: 
            return size;
    }
}

function normalizedScale(size: MonsterSize, kind: string): MonsterScale {
    return [normalizeSize(size), normalizeThreat(size, kind)];
}

export function newMonster(name:string, 
                            level:number,
                            size: MonsterSize,
                            kind: string,
                            attributes: string[],
                            book:string,
                            pageNumber: number) 
                            : Monster {      
    return {
        name: name,
        level: level,
        size: size,
        kind: kind,
        scale: normalizedScale(size, kind),
        attributes: attributes,
        book: book,
        pageNumber: pageNumber
    }                                    
}


export interface IParty {
    readonly size: number;
    readonly level: number;
}


export interface Allocation {
    readonly monster: Monster;
    readonly num:number;
    readonly cost:number;
}

export type Encounters = Allocation[][];
export type GroupedEncounters = Encounters[];

export interface Allocator {
    (party: IParty, monsters: Monster[]): Promise<GroupedEncounters>;
}

export type Facet = "name" | "size" | "source" | "kind" | "attributes";

export type FilterFacets = Map<Facet, Set<string>>;

export type FacetCounts = Map<Facet, Map<string, number>>;

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


export function predicateForFilters(filters:FilterFacets) {
    var predicates:Array<(m:Monster) => boolean> = [];

    for (const [key, attributes] of filters.entries()) {
        if (attributes === undefined || attributes.size == 0) continue;

        if (key === "name") {
            console.log("name")
            predicates.push(anyPredicate<Monster>(
                Array.from(attributes).map(namePredicate)
            ));
        }
        else if (key === "size") {
            predicates.push(anyPredicate<Monster>(
                Array.from(attributes).map(sizePredicate)
            ));
        } 
        else if (key === "kind") {
            predicates.push(anyPredicate<Monster>(
                Array.from(attributes).map(kindPredicate)
            ));
        }
        else if (key === "source") {
            predicates.push(anyPredicate<Monster>(
                Array.from(attributes).map(sourcePredicate)
            ));
        }
        else if (key === "attributes") {
            predicates.push(hasOneAttributePredicate(Array.from(attributes)));
        }            
        else {
            throw new Error("unknown filter type: " + key);
        }            
    }

    return allPredicate(predicates);
}
