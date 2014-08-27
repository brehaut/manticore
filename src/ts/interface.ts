/// <reference path="data.ts" />
/// <reference path="strings.ts" />
/// <reference path="dom.ts" />

module manticore.interface {
    var _ = strings._;

    function arrayFrom<T>(arrayLike):T[] {
        return Array.prototype.slice.apply(arrayLike);
    }

    function cssClassName(text:string):string {
        return text.replace(/[^-a-zA-Z0-9]+/g, "-");
    }

    function template(text:string, fill:{[index:string]:any}) { 
        return text.replace(/\{([a-zA-Z0-9]+?)\}/g, (_, key:string) => fill[key]);
    }

    
    interface IView {
        _appendTo(parent: HTMLElement):void;
    }


    class Event<T> {
        private handlers: Array<(v:T) => void>;
        constructor () {
            this.handlers = [];
        }

        public trigger(v:T) {
            for (var i = 0, j = this.handlers.length; i < j; i++) {
                this.handlers[i](v);
            }
        }

        public register(handler:(v:T) => void) {
            this.handlers.push(handler);
        }
    }


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

        _appendTo(el) {
            el.appendChild(this.el);
        }
    }

 
    class PartyView implements IView {
        private el:HTMLElement;

        public onChanged: Event<data.IParty>;

        constructor () {
            this.onChanged = new Event<data.IParty>();
            this.createElements();
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
                                    max?:number) {
            var input = new NumericField(val, max); 
            input.onChanged.register(_ => this.onChanged.trigger(this.getPartyInfo()));

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

        public onChanged: Event<void>;

        constructor (private name: string, 
                     private attributes:{toString:()=>string}[]) {
            this.onChanged = new Event<void>();

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
            var li = <HTMLElement> this.el.querySelector('li[data-name="' + attribute + '"]');
            li.classList.toggle("selected");

            this.onChanged.trigger(null);
        }

        private createElements() {
            var ul = DOM.ul(
                {
                    "class": "clearfix",

                    onclick: (e) => {
                        if (e.target.nodeName.toLowerCase() !== "li") return;
                        this.toggleState(e.target.getAttribute("data-name"));
                    }
                },
                this.attributes.map(key => {
                    var k = key.toString();
                    return DOM.li({"data-name": k}, [DOM.text(_(k))]);
                })
            );
            
            var header = DOM.header(null, [
                DOM.h2(null, [DOM.text(_(this.name))])
            ]);

            this.el = DOM.div({
                "class": "C attribute-filter -" + this.name.toLowerCase()
            }, [header, ul]);
        }
    }


    class FiltersView implements IView {
        private el:HTMLElement;
        private selectionCountEl:HTMLElement;

        public onFilterChanged: Event<string>;

        private sourcesView: PropertyFilterView;
        private sizeView: PropertyFilterView;
        private kindView: PropertyFilterView;
        private attributesView: PropertyFilterView;

        constructor(bestiary:bestiary.Bestiary) {
            this.onFilterChanged = new Event<string>();

            this.sourcesView = new PropertyFilterView("Sources", bestiary.allSources());
            
            this.sizeView = new PropertyFilterView("Size", bestiary.allSizes());
            this.kindView = new PropertyFilterView("Role", bestiary.allKinds());
            this.attributesView = new PropertyFilterView("Tags", bestiary.allAttributes().sort());

            this.sourcesView.onChanged.register(_ => this.onFilterChanged.trigger("source"));
            this.sizeView.onChanged.register(_ => this.onFilterChanged.trigger("size"));
            this.kindView.onChanged.register(_ => this.onFilterChanged.trigger("kind"));
            this.attributesView.onChanged.register(_ => this.onFilterChanged.trigger("attributes"));

            this.createElements();
        }

        public getFilters():{[index: string]: string[]} {
            return {
                sources: this.sourcesView.getSelectedAttributes(),
                size: this.sizeView.getSelectedAttributes(),
                kind: this.kindView.getSelectedAttributes(),
                attributes: this.attributesView.getSelectedAttributes(),
            }
        }

        public updateSelectedCount(count: number) {
            this.selectionCountEl.innerText = _("Number selected ") + count;
        }

        public _appendTo(element:HTMLElement) {
            element.appendChild(this.el);
        }

        private createElements() {
            this.el = DOM.section(
                {
                    "class": "filters clearfix"
                }, 
                [
                    DOM.header( 
                        null, 
                        [
                            DOM.h1(null, [DOM.text(_("Filter bestiary"))]),
                            DOM.p(null, [DOM.text(_("[filter summary]"))])
                        ]
                    )
                ]
            );

            [this.sourcesView, this.sizeView, this.kindView, this.attributesView]
                .forEach(v => v._appendTo(this.el))
            ;

            this.selectionCountEl = DOM.div({"class": "selection-count"});

            this.el.appendChild(this.selectionCountEl)
        }
    }



    class ResultsView implements IView {
        private el: HTMLElement;
        private resultsEl: HTMLElement;
        private moreButton: HTMLElement;

        public onRequestGenerate: Event<void>;

        private currentIndex: number;
        private pendingAllocations

        constructor () {
            this.onRequestGenerate = new Event<void>();
            
            this.createElements();
        }

        public _appendTo(el:HTMLElement) {
            el.appendChild(this.el);
        }

        public markResultsAsOutOfDate() {
            this.resultsEl.classList.add("outofdate");
        }

        public displayResults(party: data.IParty, allocs: data.Allocation[][]) {
            DOM.empty(this.resultsEl);
            
            this.resultsEl.appendChild(
                DOM.header(
                    {"class": "results-summary"},
                    [
                        DOM.h1(null, [DOM.text(_("Possible encounters"))]),
                        DOM.p(null, [DOM.text(template(_("{count} encounters for {num} level {level} characters."),
                                                       {count: allocs.length,
                                                        num: party.size,
                                                        level: party.level}))])
                    ])
            );
            this.resultsEl.classList.remove("outofdate");
            
            this.currentIndex = 0;
            this.pendingAllocations = allocs;

            this.show100();
        }

        private allocationMarkup(alloc: data.Allocation) {
            return DOM.div(
                {"class": "allocation " + alloc.monster.size},
                [
                    DOM.div({"class":"kind"},[
                        DOM.text(_(alloc.monster.kind)),
                        DOM.span({"class":"level"}, 
                                 [DOM.text(alloc.monster.level.toString())]),
                        DOM.span({"class":"book"}, 
                                 [DOM.text(alloc.monster.book)])
                    ]),
                    DOM.em({"class": "name"}, [
                        DOM.text(_(alloc.monster.name))
                    ]),
                    DOM.span({"class": "number"}, [
                        DOM.text(" ×" + alloc.num.toString())
                    ])
                ]
            );                           
        }       

        private show100() {
            var window = 100;

            var allocs = this.pendingAllocations.slice(this.currentIndex, this.currentIndex + window);

            allocs.forEach(alloc => {
                this.resultsEl.appendChild(DOM.li(
                    {"class": "clearfix"}, 
                    alloc.map(al => this.allocationMarkup(al))
                ));
            });

            this.currentIndex += window;

            if (this.currentIndex > this.pendingAllocations.length) {
                this.moreButton.style.display = "none";
            }
            else {
                this.moreButton.style.display = "inline-block";
            }
        }

        private createElements() {
            this.el = DOM.section({ 
                "class": "results"
            }, [
                DOM.header(
                    null,
                    [
                        DOM.h1(null, [DOM.text(_("Encounters"))]),
                        DOM.p(null, [DOM.text(_("[results summary]"))])
                    ]
                ),              
                DOM.div(
                    {
                        "class": "button generate",
                        
                        onclick: (e) => {
                            this.onRequestGenerate.trigger(null);
                        }
                    },
                    [
                        DOM.text(_("generate encounters"))
                    ])
            ]);

            this.resultsEl = DOM.ul({"class": "encounters"}, []);
            this.moreButton = DOM.div(
                {
                    "class":"button",

                    onclick: (e) => this.show100()
                }, 
                [DOM.text(_("more"))]
            );
            this.moreButton.style.display = "none";

            this.el.appendChild(this.resultsEl);
            this.el.appendChild(this.moreButton);
        }
    }



    // UI represents the whole UI, and is constructed of a series
    // of sub views.
    class UI implements IView {
        private viewContainer: HTMLElement;

        private partyView: PartyView;
        private filtersView: FiltersView;
        private resultsView: ResultsView;
        
        constructor(private allocator: data.Allocator, 
                    private catalog: bestiary.Bestiary, 
                    root:HTMLElement) {
            this.viewContainer = DOM.div(null);
            this.partyView = new PartyView();
            this.filtersView = new FiltersView(catalog);
            this.resultsView = new ResultsView();
            
            this.filtersView.updateSelectedCount(catalog.monsters.length);

            this.bindEvents();

            this._appendTo(root);

            this.updateSelectionInfo();
        }

        private updateSelectionInfo() {
            this.filtersView.updateSelectedCount(this.getSelection().length);
            this.resultsView.markResultsAsOutOfDate();
        }
        
        private getSelection() {
            var pred = data.predicateForFilters(this.filtersView.getFilters());
            return this.catalog.filteredBestiary(this.partyView.getPartyInfo(), pred);
        }

        private bindEvents() {
            this.filtersView.onFilterChanged.register(_ => this.updateSelectionInfo());
            this.partyView.onChanged.register(_ => this.updateSelectionInfo());

            this.resultsView.onRequestGenerate.register(_ => {
                var selection = this.getSelection();

                var alloc = this.allocator(this.partyView.getPartyInfo(),
                                           selection);

                this.resultsView.displayResults(this.partyView.getPartyInfo(), alloc);
            });
        }
        
        public _appendTo(element:HTMLElement) {
            this.partyView._appendTo(this.viewContainer);
            this.filtersView._appendTo(this.viewContainer);
            this.resultsView._appendTo(this.viewContainer);
            
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
                new UI(allocator, bestiary, root);
            })
            .catch((e) => {
                console.log(e);
            })
        ;

        loadingUI(root, bestiary);

    }
}