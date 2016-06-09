/// <reference path="strings.ts" />
/// <reference path="dom.ts" />
/// <reference path="../common/data.ts" />
/// <reference path="common.ts" />
/// <reference path="attribute-filter.tsx" />
/// <reference path="smart-filters.tsx" />
/// <reference path="manual-selection.tsx" />
/// <reference path="selection.tsx" />

module manticore.ui {
    import _ = strings._;
  


    // SelectionView wraps up the various methods of selecting monsters
    export class SelectionView {
        private el: HTMLElement;

        private selection: filters.Selection;

        public onFilterChanged: Event<string> = new Event<string>();
        private store:filters.FilterStore;
        
        constructor (private parent: HTMLElement, catalog: Atom<bestiary.Bestiary>) {
            this.store = new filters.FilterStore(catalog);                      
            this.createElements(catalog);
            
            this._appendTo(parent);
        }         
        
        private _appendTo(element:HTMLElement) {
            element.appendChild(this.el);
        }

        public getFilters() {
            return this.store.getFilters();
        }

        public updateSelectedCount(count: number) {
            this.store.updateSelectedCount(count);
            // this.filtersView.updateSelectedCount(count);
            // this.pickersView.updateSelectedCount(count);
        }

        public updateFilterCounts(filters: any) {
            this.store.updateFilterCounts(filters);
            // this.filtersView.updateFilterCounts(filters);
            // this.pickersView.updateFilterCounts(filters);
        }
å
        
        private createElements(catalog: Atom<bestiary.Bestiary>) {
            this.el = DOM.div({});
            this.selection = filters.installSelection(this.el, this.store);
        }
    }
}