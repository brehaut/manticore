/// <reference path="common/types.d.ts" />
/// <reference path="common/data.ts" />
/// <reference path="common/bestiary.ts" />
/// <reference path="ui/strings.ts" />
/// <reference path="ui/dom.ts" />
/// <reference path="ui/common.ts" />
/// <reference path="ui/party.ts" />
/// <reference path="ui/filtering.ts" />
/// <reference path="ui/results.ts" />

module manticore.ui {
    import _ = strings._;

    // UI represents the whole UI, and is constructed of a series
    // of sub views.
    // UI also acts as the primary view controller for the application    
    class UI {
        private viewContainer: HTMLElement;

        private catalog: Atom<bestiary.Bestiary>;

        private partyView: PartyView;
        private selectionView: SelectionView;
        private resultsView: ResultsView;
                        
        constructor(private root: HTMLElement,
                    private allocator: data.Allocator, 
                    private dataAccessWorker: model.DataAccessWorker) {
            this.catalog = new Atom(bestiary.createBestiary({}));                        
                        
            this.viewContainer = DOM.div(null);
            this.partyView = new PartyView(this.viewContainer);
            this.selectionView = new SelectionView(this.viewContainer, this.catalog);
            this.resultsView = new ResultsView(this.viewContainer);
            
            this.selectionView.updateSelectedCount(this.catalog.get().monsters.length);
            
            this.dataAccessWorker.onmessage = (message) => this.updateBestiary(message.data);
            this.dataAccessWorker.postMessage(messaging.dataAccess.bestiaryGetMessage());
            
            this.bindEvents();

            this._appendTo(root);

            this.updateSelectionInfo();
            this.updateEnabledFilters();
        }

        private updateBestiary(message: messaging.dataAccess.BestiaryMessage) {
            if (messaging.dataAccess.isBestiaryData(message)) {
                this.changeCatalog(bestiary.createBestiary(message.payload));
            }
            else {
                console.warn("Unexpected message", message);
            }
        }

        private changeCatalog(newCatalog: bestiary.Bestiary) {
            this.catalog.swap((_) => newCatalog);   
        }

        private updateEnabledFilters() {
            var features = this.catalog.get().featureCounts(this.partyView.getPartyInfo(),
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
            return this.catalog.get().filteredBestiary(this.partyView.getPartyInfo(), pred);
        }

        private bindEvents() {
            this.partyView.onChanged.register(_ => {
                this.updateEnabledFilters();
                this.updateSelectionInfo();
            });

            this.catalog.onChange.register(catalog => {
                this.updateEnabledFilters();
                this.updateSelectionInfo();
            })

            this.selectionView.onFilterChanged.register(_ => this.updateSelectionInfo());

            this.resultsView.onRequestGenerate.register(_ => {
                var selection = this.getSelection();

                this.allocator(this.partyView.getPartyInfo(),
                               selection)
                    .then(alloc => this.resultsView.displayResults(this.partyView.getPartyInfo(), alloc));
            });
        }
        
        public _appendTo(element:HTMLElement) {
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
                               dataAccessWorker: model.DataAccessWorker,
                               ready:Promise<void>,
                               allocator) {
        //bestiary = bestiary.then(awaitDelay(2000));

        ready
            .then<void>((_) => {
                new UI(root, allocator, dataAccessWorker);
            })
            .catch((e) => {
                console.log(e); 
            })
        ; 

        loadingUI(root, ready);

    } 
}