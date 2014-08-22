module manticore.data {
    export class Monster {
        public scale:string;
 
        constructor(public name:string, 
                    public level:number, 
                    public size:string,
                    public kind:string,
                    public attributes: Array<string>) { 
            if (kind === "mook") {
                this.scale = "mook";
            }
            else {
                this.scale = size;
            }                
        }

        public toString() {
            return this.name + "(level " + this.level + " " + this.kind + ")";
        }
    }


    export function sizePredicate(size:string) {
        return (m:Monster) => m.size === size;
    }

    export function kindPredicate(kind:string) {
        return (m:Monster) => m.kind === kind;
    }

    export function hasOneAttributePredicate(attributes:string[]) {
        return (m:Monster) => {
            var mattrs = m.attributes;
            for (var i = 0, j = attributes.length; i < j; i++) {
                if (mattrs.indexOf(attributes[i]) >= 0) return true;
            }
            return false;
        }
    }


    export interface Allocation {
        monster:Monster;
        num:number;
    }


    export interface Allocator {
        (partySize: number, partyLevel: number, monsters: Array<Monster>): Array<Array<Allocation>>;
    }

}