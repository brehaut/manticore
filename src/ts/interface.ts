/// <reference path="data.ts" />
/// <reference path="strings.ts" />
/// <reference path="dom.ts" />

module manticore.interface {
    var _ = strings._;

    
    interface IView {
        appendTo(parent: Element):void;
    }


    class NumericField implements IView {
        private el: Element;

        constructor (val:number, max?:number) {
            this.el = DOM.input({
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
                }
                
            });
        }

        appendTo(el) {
            el.appendChild(this.el);
        }
    }

 
    class PartyView implements IView {
        private el:Element;

        constructor () {
            this.createElements();
        }

        public appendTo(element:Element) {
            element.appendChild(this.el);
        }

        private labeledNumericField(label:string, className:string, val:number, max?:number) {
            var input = new NumericField(val, max); 

            var div = DOM.div(
                {"class": "field " + className},
                DOM.label(null, DOM.text(label))
            );

            input.appendTo(div); 

            return div;
        }

        private createElements() {
            var size = this.labeledNumericField(_("Party size"), "size", 4, 10);
            var level = this.labeledNumericField(_("Party level"), "level", 2, 10);

            this.el = DOM.section(
                {
                    "class": "clearfix party"
                }, 
                DOM.header(
                    null, 
                    DOM.h1(null, DOM.text(_("Party"))),
                    DOM.p(null, DOM.text(_("[party summary]")))
                ),
                size,
                level
            );
        }
    }


    class FiltersView {
        private el:Element;

        constructor(bestiary:bestiary.Bestiary) {
            console.log(bestiary.allSizes());
            console.log(bestiary.allKinds());
            console.log(bestiary.allAttributes());

            this.createElements();
        }

        public appendTo(element:Element) {
            element.appendChild(this.el);
        }

        private createElements() {
            this.el = DOM.section(
                {
                    "class": "filters"
                }, 
                DOM.header( 
                    null, 
                    DOM.h1(null, DOM.text(_("Filter bestiary"))),
                    DOM.p(null, DOM.text(_("[filter summary]")))
                )
            );
        }
    }


    // UI represents the whole UI, and is constructed of a series
    // of sub views.
    class UI {
        private viewContainer: Element;
        private partyView: PartyView;
        private filtersView: FiltersView;

        constructor(public catalog: bestiary.Bestiary) {            
            this.viewContainer = DOM.div(null);
            this.partyView = new PartyView();
            this.filtersView = new FiltersView(catalog);
        }
        
        public appendTo(element:Element) {
            this.partyView.appendTo(this.viewContainer);
            this.filtersView.appendTo(this.viewContainer);

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