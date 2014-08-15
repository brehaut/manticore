module Manticore.Data {
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


    export interface Allocation {
        monster:Monster;
        num:number;
    }



    export interface Allocator {
        (partySize: number, partyLevel: number, monsters: Array<Monster>): Array<Array<Allocation>>;
    }

}