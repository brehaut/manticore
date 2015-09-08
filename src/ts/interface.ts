/// <reference path="data.ts" />
/// <reference path="strings.ts" />
/// <reference path="dom.ts" />
/// <reference path="interface/common.ts" />
/// <reference path="interface/party.ts" />
/// <reference path="interface/filtering.ts" />
/// <reference path="interface/results.ts" />

module manticore.interface {
    var _ = strings._;

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
            var features = this.catalog.featureCounts(this.partyView.getPartyInfo(),
                                                      this.selectionView.getFilters());
            this.selectionView.updateFilterCounts(features);
        }

        private updateSelectionInfo() {
            this.selectionView.updateSelectedCount(this.getSelection().length);
            this.resultsView.markResultsAsOutOfDate();
            this.updateEnabledFilters();
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