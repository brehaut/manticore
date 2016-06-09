/// <reference path="strings.ts" />
/// <reference path="dom.ts" />
/// <reference path="../common/data.ts" />
/// <reference path="common.ts" />
/// <reference path="attribute-filter.tsx" />
/// <reference path="smart-filters.tsx" />

module manticore.ui {
    import _ = strings._;
    
    
    class PropertyFilterView {
        private el:HTMLElement;

        public onChanged = new Event<void | string[]>();
        private filter: filters.AttributeFilter;

        constructor (parent: HTMLElement,
                     name: string, 
                     attributes:{toString:()=>string}[]) {
            this.createElements(name, attributes);
            
            this._appendTo(parent);
        } 
        
        public remove() {
            this.el.remove();
        }

        private _appendTo(parent:HTMLElement) {
            parent.appendChild(this.el);
        }

        public getSelectedAttributes():string[] {            
            return this.filter.getSelectedAttributes();
        }

        public updateFilterCounts(filters:{[index: string]: number}) {
            this.filter.updateCounts(filters);            
        }
        
        private createElements(name, attributes) {           
            this.el = DOM.div(null, []);
            const props = {name: name, attributes: attributes.map(a => a.toString())};

            this.filter = filters.install(this.el, props);
            // TODO: figure out this required setTimeout hack that is causing the render to not occur
            this.filter.onChanged.register(v => setTimeout(() => this.onChanged.trigger(v), 0));
        }
    }

    
    interface IFilterSource {
        onFilterChanged: Event<string>
        
        getFilters():{[index: string]: string[]};

        updateSelectedCount(count: number);
        updateFilterCounts(filters: any);
    }
    

    class FiltersView implements IFilterSource {
        private el:HTMLElement;
        private selectionCountEl:HTMLElement;
        private filtersContainer: HTMLElement;

        public onFilterChanged: Event<string> = new Event<string>();

        private sourcesView: PropertyFilterView;
        private sizeView: PropertyFilterView;
        private kindView: PropertyFilterView;
        private attributesView: PropertyFilterView;

        private filters: filters.SmartFilter;

        constructor(parent: HTMLElement, private bestiary:Atom<bestiary.Bestiary>) {           
            this.createElements();
            //this.createSubViews(bestiary.get());

            this.setVisibility(false);
            
            this.bestiary.onChange.register(bestiary => this.catalogChanged(bestiary));
                        
            this._appendTo(parent);
        }

        private createSubViews(newCatalog: bestiary.Bestiary) {
            // this.sourcesView = new PropertyFilterView(this.filtersContainer, "Sources", newCatalog.allSources());
            
            // this.sizeView = new PropertyFilterView(this.filtersContainer, "Size", newCatalog.allSizes());
            // this.kindView = new PropertyFilterView(this.filtersContainer, "Role", newCatalog.allKinds());
            // this.attributesView = new PropertyFilterView(this.filtersContainer, "Tags", newCatalog.allAttributes().sort());

            // this.sourcesView.onChanged.register(_ => this.onFilterChanged.trigger("source"));
            // this.sizeView.onChanged.register(_ => this.onFilterChanged.trigger("size"));
            // this.kindView.onChanged.register(_ => this.onFilterChanged.trigger("kind"));
            // this.attributesView.onChanged.register(_ => this.onFilterChanged.trigger("attributes"));
        }

        private catalogChanged(newCatalog: bestiary.Bestiary) {
            // this.sourcesView.remove();
            // this.sizeView.remove();
            // this.kindView.remove();
            // this.attributesView.remove();
            
            // this.createSubViews(newCatalog);   
        }
        
        public setVisibility(visible: boolean) {
            this.el.style.display = visible ? "block" : "none";  
        }

        public getFilters():{[index: string]: string[]} {
            return this.filters.getFilters();
        }

        public updateFilterCounts(filters:any) {
            this.filters.updateFilterCounts(filters);
            // this.sourcesView.updateFilterCounts(filters.sources);
            // this.sizeView.updateFilterCounts(filters.sizes);
            // this.kindView.updateFilterCounts(filters.kinds);
            // this.attributesView.updateFilterCounts(filters.attributes);
        }
        
        public updateSelectedCount(count: number) {
            // this.selectionCountEl.textContent = _("Number selected ") + count;
        }

        private _appendTo(element:HTMLElement) {
            element.appendChild(this.el);
        }

        private createElements() {
            this.el = DOM.div({});
            this.filters = filters.installSmartFilter(this.el, this.bestiary);
            // TODO: remove set timeout
            this.filters.onChanged.register(([name, attrs]) => setTimeout(() => this.onFilterChanged.trigger(name), 0));
        }
    }



    class MonsterPickerView implements IFilterSource {
        private el: HTMLElement;

        public onFilterChanged: Event<string> = new Event<string>();

        private byNameView: PropertyFilterView;
        
        constructor (parent: HTMLElement, private catalog: Atom<bestiary.Bestiary>) {           
            this.createElements();
                        
            this.createSubViews(catalog.get());
            this.catalog.onChange.register(bestiary => this.catalogChanged(bestiary));
            
            this.setVisibility(false);
            
            this._appendTo(parent);
        }
        
        private createSubViews(newCatalog: bestiary.Bestiary) {
            this.byNameView = new PropertyFilterView(this.el, "By Name", newCatalog.allNames().sort());

            this.byNameView.onChanged.register(_ => this.onFilterChanged.trigger("names"));
        }

        private catalogChanged(newCatalog: bestiary.Bestiary) {
            this.byNameView.remove();
            
            this.createSubViews(newCatalog);   
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
        }
        
        private _appendTo(html:HTMLElement) {
            html.appendChild(this.el);
        }
    }
    

    // SelectionView wraps up the various methods of selecting monsters
    export class SelectionView implements IFilterSource {
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
        
        constructor (private parent: HTMLElement, catalog: Atom<bestiary.Bestiary>) {                      
            this.createElements();
            
            this.filtersView = new FiltersView(this.el, catalog);
            this.pickersView = new MonsterPickerView(this.el, catalog);

            this.filtersView.onFilterChanged.register(v => this.onFilterChanged.trigger(v));
            this.pickersView.onFilterChanged.register(v => this.onFilterChanged.trigger(v));

            this.setMode(SelectionView.filtersMode);
            
            this._appendTo(parent);
        }         
        
        private _appendTo(element:HTMLElement) {
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
            var filtersMode = (e) => {
                this.setMode(SelectionView.filtersMode);
                e.preventDefault();
                e.stopPropagation();
            };

            var pickerMode = (e) => {
                this.setMode(SelectionView.pickersMode);
                e.preventDefault();
                e.stopPropagation();
            };
            
            this.el = ui.sectionMarkup("Filter monsters", "selection", "[select monsters]",
                [
                    DOM.div(
                        null,
                        [ DOM.p(null, [
                            DOM.text(_("[selection mode]")),
                            DOM.text(" "),
                            DOM.a({
                                "class": "mode-switch -filters",
                                onclick: filtersMode,
//                                ontouchend: filtersMode
                            }, [
                                DOM.text(_("[use filters]"))
                            ]),
                            DOM.text(" "),
                            DOM.a({
                                "class": "mode-switch -picker",
                                onclick: pickerMode,
//                                ontouchend: pickerMode
                            }, [
                                DOM.text(_("[use pickers]"))
                            ])]),                          
                        ]
                    )
                ]
            );
        }
    }
}