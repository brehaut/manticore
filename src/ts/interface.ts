/// <reference path="data.ts" />
/// <reference path="strings.ts" />
/// <reference path="dom.ts" />

module manticore.interface {
    var _ = strings._;

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
            var selected = Array.from<Node>(this.el.querySelectorAll("li"))
                .map<string>((el:HTMLElement) =>
                    el.classList.contains("selected") ? el.getAttribute("data-name") : null)
               .filter((attr) => !!attr)
           ;

           return selected;
        }

        public updateFilterCounts(filters:{[index: string]: number}) {
             Array.from<Node>(this.el.querySelectorAll("li"))
                .forEach((el:HTMLElement) => {
                    var name = el.getAttribute("data-name");
                    var count = filters[name] || 0;

                    if (count > 0) {
                        el.classList.add("viable");
                    } 
                    else { 
                        el.classList.remove("viable");
                    }
                    (<HTMLElement> el.querySelector(".count")).textContent = count.toString();
                });
            
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
                    return DOM.li({"data-name": k}, [
                        DOM.text(_(k)),
                        DOM.span({"class": "count"}, [])
                    ]);
                })
            );
            
            var header = DOM.header(null, [
                DOM.h2(null, [DOM.text(_(this.name))])
            ]);

            this.el = DOM.div({
                "class": "C attribute-filter -" + this.name.toLowerCase().replace(" ", "-")
            }, [header, ul]);
        }
    }

    
    interface IFilterSource {
        onFilterChanged: Event<string>
        
        getFilters():{[index: string]: string[]};

        updateSelectedCount(count: number);
        updateFilterCounts(filters: any);
    }
    

    class FiltersView implements IView, IFilterSource {
        private el:HTMLElement;
        private selectionCountEl:HTMLElement;

        public onFilterChanged: Event<string> = new Event<string>();

        private sourcesView: PropertyFilterView;
        private sizeView: PropertyFilterView;
        private kindView: PropertyFilterView;
        private attributesView: PropertyFilterView;

        constructor(bestiary:bestiary.Bestiary) {
            this.sourcesView = new PropertyFilterView("Sources", bestiary.allSources());
            
            this.sizeView = new PropertyFilterView("Size", bestiary.allSizes());
            this.kindView = new PropertyFilterView("Role", bestiary.allKinds());
            this.attributesView = new PropertyFilterView("Tags", bestiary.allAttributes().sort());

            this.sourcesView.onChanged.register(_ => this.onFilterChanged.trigger("source"));
            this.sizeView.onChanged.register(_ => this.onFilterChanged.trigger("size"));
            this.kindView.onChanged.register(_ => this.onFilterChanged.trigger("kind"));
            this.attributesView.onChanged.register(_ => this.onFilterChanged.trigger("attributes"));

            this.createElements();

            this.setVisibility(false);
        }

        public setVisibility(visible: boolean) {
            this.el.style.display = visible ? "block" : "none";  
        }

        public getFilters():{[index: string]: string[]} {
            return {
                sources: this.sourcesView.getSelectedAttributes(),
                size: this.sizeView.getSelectedAttributes(),
                kind: this.kindView.getSelectedAttributes(),
                attributes: this.attributesView.getSelectedAttributes(),
            }
        }

        public updateFilterCounts(filters:any) {
            this.sourcesView.updateFilterCounts(filters.sources);
            this.sizeView.updateFilterCounts(filters.sizes);
            this.kindView.updateFilterCounts(filters.kinds);
            this.attributesView.updateFilterCounts(filters.attributes);
        }
        
        public updateSelectedCount(count: number) {
            this.selectionCountEl.textContent = _("Number selected ") + count;
        }

        public _appendTo(element:HTMLElement) {
            element.appendChild(this.el);
        }

        private createElements() {
            this.el = DOM.div(
                {
                    "class": "filters clearfix"
                }, 
                [
                    DOM.header( 
                        null, 
                        [
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



    class MonsterPickerView implements IView, IFilterSource{
        private el: HTMLElement;

        public onFilterChanged: Event<string> = new Event<string>();

        //private sourcesView: PropertyFilterView;
        private byNameView: PropertyFilterView;
        
        constructor (private catalog: bestiary.Bestiary) {            
            //this.sourcesView = new PropertyFilterView("Sources", catalog.allSources());
            this.byNameView = new PropertyFilterView("By Name", catalog.allNames().sort());
            
            this.createElements();

            this.setVisibility(false);
        }

        public setVisibility(visible: boolean) {
            this.el.style.display = visible ? "block" : "none";  
        }
        
        public getFilters():{[index: string]: string[]} {
            return {
                name: this.byNameView.getSelectedAttributes()
            }; 
        }

        public updateSelectedCount(count: number) {
            
        }

        public updateFilterCounts(filters: any) {
            // TODO
            var counts:{[index:string]: number} = {};
            this.catalog.allNames().forEach(name => counts[name] = 1);
            this.byNameView.updateFilterCounts(counts);
        }
        
        private createElements() {
            this.el = DOM.div(
                {
                    "class": "filters clearfix",                
                },
                [
                    DOM.header(
                        null,
                        [
                            DOM.p(null, [DOM.text(_("[select monsters]"))])
                        ]
                    )
                ]
            );

            //this.sourcesView._appendTo(this.el);
            this.byNameView._appendTo(this.el);
        }
        
        public _appendTo(html:HTMLElement) {
            html.appendChild(this.el);
        }
    }
    

    // SelectionView wraps up the various methods of selecting monsters
    //
    // Elements from Filters view need to be hoisted into here (total selection summary
    // and source summary frinstance)
    class SelectionView implements IView, IFilterSource {
        private el: HTMLElement;
        private filtersView: FiltersView;
        private pickersView: MonsterPickerView;

        public onFilterChanged: Event<string> = new Event<string>();

        private static filtersMode = {
            "class": "filters",
            
            display: (view: SelectionView) => {
                view.showChildView(true);
            },

            getFilters: (view: SelectionView) => view.filtersView.getFilters()
        };

        private static pickersMode = {
            "class": "picker",
            
            display: (view: SelectionView) => {
                view.showChildView(false);
            },

            getFilters: (view: SelectionView) => view.pickersView.getFilters()
        };

        private mode;
        
        constructor (catalog: bestiary.Bestiary) {
            this.filtersView = new FiltersView(catalog);
            this.pickersView = new MonsterPickerView(catalog);

            this.filtersView.onFilterChanged.register(v => this.onFilterChanged.trigger(v));
            this.pickersView.onFilterChanged.register(v => this.onFilterChanged.trigger(v));
           
            this.createElements();

            this.setMode(SelectionView.filtersMode);
        }         
        
        public _appendTo(element:HTMLElement) {
            element.appendChild(this.el);
        }

        public getFilters() {
            return this.mode.getFilters(this);
        }

        public updateSelectedCount(count: number) {
            this.filtersView.updateSelectedCount(count);
            this.pickersView.updateSelectedCount(count);
        }

        public updateFilterCounts(filters: any) {
            this.filtersView.updateFilterCounts(filters);
            this.pickersView.updateFilterCounts(filters);
        }

        private setMode(mode) {
            this.mode = mode;
            mode.display(this);
            
            Array.from(this.el.querySelectorAll("a.mode-switch")).forEach(el => (<HTMLElement>el).classList.remove("-active"));
            var active = (<HTMLElement>this.el.querySelector("a.mode-switch.-" + this.mode["class"]));
            if (active) active.classList.add("-active");
        }
        
        private showChildView(filtersVisible: boolean) {
            this.filtersView.setVisibility(filtersVisible);
            this.pickersView.setVisibility(!filtersVisible);
        }
        
        private createElements() {
            this.el = DOM.section(
                {
                    "class": "selection clearfix",                
                },
                [
                    DOM.header(
                        null,
                        [
                            DOM.h1(null, [DOM.text(_("Filter monsters"))]),
                            DOM.p(null, [DOM.text(_("[select monsters]"))])
                        ]
                    ),

                    DOM.div(
                        null,
                        [ DOM.p(null, [DOM.text(_("[selection mode]"))]),
                          DOM.a({
                              "class": "mode-switch -filters",
                              onclick:(e) => {
                                  this.setMode(SelectionView.filtersMode);
                                  e.preventDefault();
                              }
                          }, [
                              DOM.text(_("[use filters]"))
                          ]),
                          DOM.a({
                              "class": "mode-switch -picker",
                              onclick:(e) => {
                                  this.setMode(SelectionView.pickersMode);
                                  e.preventDefault();
                              }
                          }, [
                              DOM.text(_("[use pickers]"))
                          ])
                        ]
                    )
                ]
            );

            this.filtersView._appendTo(this.el);
            this.pickersView._appendTo(this.el);
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
            
            this.resultsEl.appendChild(this.resultsSummary(party, allocs));
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

        private resultsSummary(party: data.IParty, allocs: data.Allocation[][]) {
            return DOM.header(
                {"class": "results-summary"},
                [
                    DOM.h1(null, [DOM.text(_("Possible encounters"))]),
                    DOM.p(null, [DOM.text(template(_("{count} encounters for {num} level {level} characters."),
                                                   {count: allocs.length,
                                                    num: party.size,
                                                    level: party.level}))])
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
    // UI also acts as the primary view controller for the application    
    class UI implements IView {
        private viewContainer: HTMLElement;

        private partyView: PartyView;
        private selectionView: SelectionView;
        private resultsView: ResultsView;
        
        constructor(private allocator: data.Allocator, 
                    private catalog: bestiary.Bestiary, 
                    root:HTMLElement) {
            this.viewContainer = DOM.div(null);
            this.partyView = new PartyView();
            this.selectionView = new SelectionView(catalog);
            this.resultsView = new ResultsView();
            
            this.selectionView.updateSelectedCount(catalog.monsters.length);

            this.bindEvents();

            this._appendTo(root);

            this.updateSelectionInfo();
            this.updateEnabledFilters();
        }

        private updateEnabledFilters() {
            var features = this.catalog.featureCounts(this.partyView.getPartyInfo());
            this.selectionView.updateFilterCounts(features);
        }

        private updateSelectionInfo() {
            this.selectionView.updateSelectedCount(this.getSelection().length);
            this.resultsView.markResultsAsOutOfDate();
        }
        
        private getSelection() {
            var pred = data.predicateForFilters(this.selectionView.getFilters());
            return this.catalog.filteredBestiary(this.partyView.getPartyInfo(), pred);
        }

        private bindEvents() {
            this.partyView.onChanged.register(_ => {
                this.updateEnabledFilters();
                this.updateSelectionInfo()
            });

            this.selectionView.onFilterChanged.register(_ => this.updateSelectionInfo());

            this.resultsView.onRequestGenerate.register(_ => {
                var selection = this.getSelection();

                var alloc = this.allocator(this.partyView.getPartyInfo(),
                                           selection);

                this.resultsView.displayResults(this.partyView.getPartyInfo(), alloc);
            });
        }
        
        public _appendTo(element:HTMLElement) {
            this.partyView._appendTo(this.viewContainer);
            this.selectionView._appendTo(this.viewContainer);
            this.resultsView._appendTo(this.viewContainer);            
            
            element.appendChild(this.viewContainer);
        }
    }


    // testing utility
    function awaitDelay(t) {
        return (v) => new Promise<any>((resolve, _) => setTimeout(() => resolve(v), t));
    }


    // show a loading bezel while the json data is loading.
    function loadingUI(root, promise) { 
        var loading = DOM.div({"class": "loading"}, [DOM.text(_("Loading..."))])
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
        //bestiary = bestiary.then(awaitDelay(2000));

        bestiary
            .then<void>((bestiary) => {
                new UI(allocator, bestiary, root);
            })
            .catch((e) => {
                console.log(e); 
            })
        ; 

        loadingUI(root, bestiary);

    } 
}