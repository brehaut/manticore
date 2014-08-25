/// <reference path="data.ts" />
/// <reference path="strings.ts" />
/// <reference path="dom.ts" />

module manticore.interface {
    var _ = strings._;

    function arrayFrom<T>(arrayLike):T[] {
        return Array.prototype.slice(arrayLike);
    }

    
    interface IView {
        _appendTo(parent: HTMLElement):void;
    }


    class NumericField implements IView {
        private el: HTMLElement;

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

        _appendTo(el) {
            el.appendChild(this.el);
        }
    }

 
    class PartyView implements IView {
        private el:HTMLElement;

        constructor () {
            this.createElements();
        }

        public _appendTo(element:HTMLElement) {
            element.appendChild(this.el);
        }

        private labeledNumericField(label:string, className:string, val:number, max?:number) {
            var input = new NumericField(val, max); 

            var div = DOM.div(
                {"class": "field " + className},
                [DOM.label(null, [DOM.text(label)])]
            );

            input._appendTo(div); 

            return div;
        }

        private createElements() {
            var size = this.labeledNumericField(_("Party size"), "size", 4, 10);
            var level = this.labeledNumericField(_("Party level"), "level", 2, 10);

            this.el = DOM.section(
                {
                    "class": "clearfix party"
                }, 
                [
                    DOM.header(
                        null, 
                        [
                            DOM.h1(null, [DOM.text(_("Party"))]),
                            DOM.p(null, [DOM.text(_("[party summary]"))])
                        ]
                    ),
                    size,
                    level
                ]
            );
        }
    }


    class PropertyFilterView implements IView {
        private el:HTMLElement;

        constructor (private name: string, 
                     private attributes:{toString:()=>string}[]) {
            this.createElements();
        } 

        public _appendTo(parent:HTMLElement) {
            parent.appendChild(this.el);
        }

        public getSelectedAttributes() {            
            var selected = arrayFrom<HTMLElement>(this.el.querySelectorAll("li"))
                .map<string>((el:HTMLElement) =>
                    el.classList.contains("selected") ? el.getAttribute("data-name") : null)
               .filter((attr) => !!attr)
           ;

           return selected;
        }

        private toggleState(attribute:string) {
            var li = <HTMLElement> this.el.querySelector("li[data-name=" + attribute + "]");
            li.classList.toggle("selected");
        }

        private createElements() {
            var ul = DOM.ul(
                {
                    onclick: (e) => {
                        if (e.target.nodeName.toLowerCase() !== "li") return;
                        this.toggleState(e.target.getAttribute("data-name"));
                    }
                }   
            );
            
            this.el = DOM.div(null, [ul]);
        }
    }


    class FiltersView implements IView {
        private el:HTMLElement;

        constructor(bestiary:bestiary.Bestiary) {
            this.createElements();
        }

        public _appendTo(element:HTMLElement) {
            element.appendChild(this.el);
        }

        private createElements() {
            this.el = DOM.section(
                {
                    "class": "filters"
                }, 
                [DOM.header( 
                    null, 
                    [
                        DOM.h1(null, [DOM.text(_("Filter bestiary"))]),
                        DOM.p(null, [DOM.text(_("[filter summary]"))])
                    ]
                )]
            );
        }
    }


    // UI represents the whole UI, and is constructed of a series
    // of sub views.
    class UI implements IView {
        private viewContainer: HTMLElement;
        private partyView: PartyView;
        private filtersView: FiltersView;

        constructor(public catalog: bestiary.Bestiary, root:HTMLElement) {            
            this.viewContainer = DOM.div(null);
            this.partyView = new PartyView();
            this.filtersView = new FiltersView(catalog);

            this._appendTo(root);
        }
        
        public _appendTo(element:HTMLElement) {
            this.partyView._appendTo(this.viewContainer);
            this.filtersView._appendTo(this.viewContainer);

            element.appendChild(this.viewContainer);
        }
    }


    // testing utility
    function awaitDelay(t) {
        return new Promise<any>((resolve, _) => setTimeout(resolve, t));
    }


    // show a loading bezel while the json data is loading.
    function loadingUI(root, promise) {
        var loading = DOM.div(null, [DOM.text("Loading...")])
        root.appendChild(loading);

        promise.then((_) => {
            DOM.remove(loading);
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
                new UI(bestiary, root);
            })
            .catch((e) => {
                console.log(e);
            })
        ;

        loadingUI(root, bestiary);

    }
}