/// <reference path="../common/data.ts" />
/// <reference path="party-ui.tsx" />
/// <reference path="strings.ts" />
/// <reference path="dom.ts" />
/// <reference path="common.ts" />

module manticore.ui {
    import _ = strings._;
    import Event = manticore.ui.Event;

    
    class NumericField {
        private el: HTMLInputElement;

        public onChanged: Event<number>;

        constructor (parent: HTMLElement, val:number, max?:number) {
            this.onChanged = new Event<number>();

            this.el = <HTMLInputElement> DOM.input({
                type: "number",
                min: 1,
                max: max,
                value: val,
                onkeydown: (e) => {
                    if ([48,49,50,51,52,53,54,55,56,57, // numbers
                         37,38,39,40,                   // arrows
                         8,9,                           // del,  bksp
                         46                             // tab
                        ]
                        .indexOf(e.keyCode) == -1) {
                        e.preventDefault();
                        return;
                    }                    
                },
                onchange: (e) => {
                    var v = Math.max(0, Math.min(+e.target.value, max || Infinity));
                    e.target.value = v;

                    this.onChanged.trigger(v);
                }
                
            });
            
            this._appendTo(parent);
        }
        
        public setValue(value: number) {
            this.el.value = value.toString();
        }

        private _appendTo(el) {
            el.appendChild(this.el);
        }
    }

    
    
    export class PartyView {        
        private worker = manticore.model.partyWorker(); 
        
        private partyComp: party.Party;

        public onChanged: Event<data.IParty>;

        constructor (private parent: HTMLElement) {
            this.onChanged = new Event<data.IParty>();
            this.createElements();
        }

        public getPartyInfo():data.IParty {
            return this.partyComp.getPartyInfo();
        }
        
        private createElements() {            
            this.partyComp = party.installParty(this.parent, this.worker);
        }
    }
}