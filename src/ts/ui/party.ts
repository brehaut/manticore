/// <reference path="../data.ts" />
/// <reference path="../strings.ts" />
/// <reference path="../dom.ts" />
/// <reference path="common.ts" />
/// <reference path="../ui.ts" />

module manticore.ui {
    import _ = strings._;
    import Event = manticore.ui.Event;

    
    class NumericField implements IView {
        private el: HTMLInputElement;

        public onChanged: Event<number>;

        constructor (val:number, max?:number) {
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
        }
        
        public setValue(value: number) {
            this.el.value = value.toString();
        }

        _appendTo(el) {
            el.appendChild(this.el);
        }
    }

    
    
    export class PartyView implements IView {
        private el:HTMLElement;
        private size: NumericField;
        private level: NumericField;
        private worker = manticore.model.partyWorker(); 
        

        public onChanged: Event<data.IParty>;

        constructor () {
            this.onChanged = new Event<data.IParty>();
            this.createElements();
            this.worker.onmessage = (message:workers.ILightWeightMessageEvent<data.IParty>) => this.storageChanged(message.data);
        }

        public getPartyInfo():data.IParty {
            return {
                level: +(<HTMLInputElement> this.el.querySelector("div.level input")).value,
                size: +(<HTMLInputElement> this.el.querySelector("div.size input")).value
            };
        }

        public _appendTo(element:HTMLElement) {
            element.appendChild(this.el);
        }

        private labeledNumericField(label:string, 
                                    className:string, 
                                    val:number, 
                                    max?:number):[HTMLElement, NumericField] {
            var input = new NumericField(val, max); 
            input.onChanged.register(_ => this.fieldChanged());

            var div = DOM.div(
                {"class": "field " + className},
                [DOM.label(null, [DOM.text(label)])]
            );

            input._appendTo(div); 

            return [div, input];
        }
        
        private storageChanged(data: data.IParty) {
            console.log(data);
            this.size.setValue(data.size);
            this.level.setValue(data.level);
        }
        
        private fieldChanged() {
            const partyInfo = this.getPartyInfo();
            this.worker.postMessage(messaging.dataAccess.partyPutMessage(partyInfo));
            this.onChanged.trigger(partyInfo);
        }

        private createElements() {
            var [sizeEl, sizeField] = this.labeledNumericField(_("Party size"), "size", 4, 10);
            var [levelEl, levelField] = this.labeledNumericField(_("Party level"), "level", 2, 10);
            
            this.size = sizeField;
            this.level = levelField;

            this.el = ui.sectionMarkup("Party", "party", "[party summary]", [
                sizeEl,
                levelEl
            ]);
        }
    }
}