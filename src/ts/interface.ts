/// <reference path="data.ts" />
/// <reference path="dom.ts" />

module manticore.interface {

    class PartyView {
        private el:Element;

        constructor () {
            this.createElements();
        }

        public appendTo(element:Element) {
            element.appendChild(this.el);
        }

        private labelNumericField(label:string, className:string, val:number, max?:number) {
            var input = DOM.input({
                value: val,
                "class": className,
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
                }
                
            });

            return DOM.div(
                null, 
                DOM.label(null, DOM.text(label)),
                input
            );
        }

        private createElements() {
            var size = this.labelNumericField("Party size", "size", 4, 10);
            var level = this.labelNumericField("Party level", "level", 2, 10);

            this.el = DOM.section(
                {
                    className: "party"
                }, 
                DOM.header(
                    null, 
                    DOM.h1(null, DOM.text("Party")),
                    DOM.p(null, DOM.text("Set the size and level of the party. This is used to determine the cost of individual monsters, and set the size of the encounter."))
                ),
                size,
                level
            );
        }
    }


    // UI represents the whole UI, and is constructed of a series
    // of sub views.
    class UI {
        private viewContainer: Element;
        private partyView: PartyView;

        constructor(public catalog: bestiary.Bestiary) {            
            this.viewContainer = DOM.div(null);
            this.partyView = new PartyView();
        }
        
        public appendTo(element:Element) {
            this.partyView.appendTo(this.viewContainer);

            element.appendChild(this.viewContainer);
        }
    }


    // testing utility
    function awaitDelay(t) {
        return new Promise<any>((resolve, _) => setTimeout(resolve, t));
    }


    // show a loading bezel while the json data is loading.
    function loadingUI(root, promise) {
        var loading = DOM.div(null, DOM.text("Loading..."))
        root.appendChild(loading);

        promise.then((_) => {
            loading.remove();
        });
    }

    // initialize is the public interface tothe UI; it will 
    // instantiate everythign and do the basic procedures requred
    // to get a UI going for the given data.
    export function initialize(root, 
                               bestiary:Promise<bestiary.Bestiary>,
                               allocator) {

        // artificial loading delay
        bestiary = bestiary.then((_) => awaitDelay(2000));

        bestiary
            .map<void>((bestiary) => {
                new UI(bestiary).appendTo(root);
            })
            .catch((e) => {
                console.log(e);
            })
        ;

        loadingUI(root, bestiary);

    }
}