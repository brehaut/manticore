/// <reference path="../strings.ts" />
/// <reference path="../dom.ts" />
/// <reference path="../data.ts" />
/// <reference path="common.ts" />

module manticore.interface {
    import _ = strings._;
    
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

        public getSelectedAttributes():string[] {            
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
                    if (el.classList.contains("clear-selection")) return;
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

        private changeOccured() {
            this.toggleClear();
            this.onChanged.trigger(null);
        }
        
        private toggleState(attribute:string) { 
            var li = <HTMLElement> this.el.querySelector('li[data-name="' + attribute + '"]');
            li.classList.toggle("selected");

            this.changeOccured();
        }

        private toggleClear() {
            if (this.allChoices().filter(li => li.classList.contains("selected")).length > 0) {
                this.el.classList.add("active");
            }
            else {
                this.el.classList.remove("active");
            }
        }

        private allChoices():HTMLElement[] {
            return <HTMLElement[]>Array.from<Node>(this.el.querySelectorAll("li[data-name]"));
        }
        
        private clearAll() {
            var all = this.allChoices();
            all.forEach((li) => {
                li.classList.remove("selected");
            });

            this.changeOccured();
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
                DOM.h2(null, [
                    DOM.text(_(this.name)),
                    DOM.a({
                        "class": "reset",
                        "onclick": (e) => {
                            e.preventDefault();
                            this.clearAll();
                        }
                    }, [DOM.text(_("[reset]"))])
                ])
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

        private byNameView: PropertyFilterView;
        
        constructor (private catalog: bestiary.Bestiary) {            
            this.byNameView = new PropertyFilterView("By Name", catalog.allNames().sort());

            this.byNameView.onChanged.register(_ => this.onFilterChanged.trigger("names"));
            
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
            console.log(filters.names);
            this.byNameView.updateFilterCounts(filters.names);
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
                            DOM.p(null, [DOM.text(_("[pick monsters]"))])
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
    export class SelectionView implements IView, IFilterSource {
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

            this.onFilterChanged.trigger("");
        }
        
        private showChildView(filtersVisible: boolean) {
            this.filtersView.setVisibility(filtersVisible);
            this.pickersView.setVisibility(!filtersVisible);
        }
        
        private createElements() {
            this.el = interface.sectionMarkup("Filter monsters", "selection", "[select monsters]",
                [
                    DOM.div(
                        null,
                        [ DOM.p(null, [
                            DOM.text(_("[selection mode]")),
                            DOM.text(" "),
                            DOM.a({
                                "class": "mode-switch -filters",
                                onclick:(e) => {
                                    this.setMode(SelectionView.filtersMode);
                                    e.preventDefault();
                                }
                            }, [
                                DOM.text(_("[use filters]"))
                            ]),
                            DOM.text(" "),
                            DOM.a({
                                "class": "mode-switch -picker",
                                onclick:(e) => {
                                    this.setMode(SelectionView.pickersMode);
                                    e.preventDefault();
                                }
                            }, [
                                DOM.text(_("[use pickers]"))
                            ])]),                          
                        ]
                    )
                ]
            );

            this.filtersView._appendTo(this.el);
            this.pickersView._appendTo(this.el);
        }
    }
}