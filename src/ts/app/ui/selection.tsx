/// <reference path="../../vendor/react.d.ts" />

/// <reference path="strings.ts" />
/// <reference path="smart-filters.tsx" />
/// <reference path="manual-selection.tsx" />

module manticore.ui.filters {
    "use strict";
    import _ = manticore.ui.strings._; 


    export class FilterStore {
        public onChanged = new Event<void>();


        private selectedCount = 0;
        private filterCounts:any = {};
        private filters:any = {};

        constructor() {

        }

        public getCatalog() { // TODO: remove
            return bestiary.createBestiary({});
        }

        public getSelectedCount() {
            return this.selectedCount;
        }

        public updateSelectedCount(count: number) {
            this.selectedCount = count;
            this.onChanged.trigger(undefined);
        }

        public getFilterCounts() {
            return this.filterCounts;
        }

        public updateFilterCounts(filters: any) {
            this.filterCounts = filters;
            this.onChanged.trigger(undefined);
        }

        public getFilters() { 
            return this.filters;
        }

        public updateFilters(filters: any) {
            this.filters = filters;
            this.onChanged.trigger(undefined);
        }
    }


    enum SelectionMode {
        Smart,
        Manual
    }

    interface SelectionProps {
        store: FilterStore;
        catalog: bestiary.Bestiary;
        counts: any;
    }

    interface SelectionState {
        mode: SelectionMode;
        filters: any;
        totalSelectedCount: number;
        counts: any;
    }

    export class Selection extends React.Component<SelectionProps, SelectionState> {
        constructor(props: SelectionProps) {
            super(props);

            this.props.store.onChanged.register(_ => {
                this.setState(this.computeStateFromStore());
            });

            this.state = this.computeStateFromStore();
        }

        private computeStateFromStore(): SelectionState {
            return { 
                mode: SelectionMode.Smart, 
                filters: this.props.store.getFilters(), 
                totalSelectedCount: this.props.store.getSelectedCount() ,
                counts: this.props.store.getFilterCounts()
            };
        }

        public render() {
            const mode = this.state.mode;

            return (
                <section className="selection">
                    <header>
                        <h1>{_("Filter monsters")}</h1>
                        <p>
                            {_("[select monsters]")}
                        </p>
                    </header>

                    <div>
                        <p>
                            {_("[selection mode]") + " "}
                            <a className={`mode-switch -filters ${mode === SelectionMode.Smart ? "active" : ""}`}
                               onClick={() => this.switchMode(SelectionMode.Smart)}>
                                {_("[use filters]")}
                            </a>
                            {" "}
                            <a className={`mode-switch -filters ${mode === SelectionMode.Manual ? "active" : ""}`}
                               onClick={() => this.switchMode(SelectionMode.Manual)}>
                                {_("[use pickers]")}
                            </a>
                        </p>
                    </div>

                    { this.state.mode === SelectionMode.Smart 
                        ? <SmartFilter catalog={this.props.catalog} 
                                       filterSelections={this.state.filters}
                                       counts={ this.state.counts }
                                       onChanged={([name, filters]) => this.filtersChanged(name, filters)} 
                                       totalSelectedCount= { this.state.totalSelectedCount } />
                        : <ManualSelection catalog={this.props.catalog}
                                           filterSelections={this.state.filters} 
                                           onChanged={([name, filters]) => this.filtersChanged(name, filters)} /> }
                </section>
            );
        } 

        private filtersChanged(name, filters) {
            this.props.store.updateFilters(filters); // the store will trigger an update event that will be propagated to setState
        }

        private switchMode(mode: SelectionMode) {
            this.setState({mode: mode} as SelectionState);
        }
    }


    export function installSelection(el, store, catalog):Selection {
        return ReactDOM.render(<Selection store={store} catalog={catalog} counts={ {} }/>, el) as Selection;
    }
}