/// <reference path="../../vendor/react.d.ts" />

/// <reference path="strings.ts" />
/// <reference path="smart-filters.tsx" />
/// <reference path="manual-selection.tsx" />

module manticore.ui.filters {
    import _ = manticore.ui.strings._; 


    export class FilterStore {
        public onChanged = new Event<void>();

        private catalog: Atom<bestiary.Bestiary>;
        private selectedCount = 0;
        private filterCounts:any = {};
        private filters:any = {};

        constructor(catalog: Atom<bestiary.Bestiary>) {
            this.catalog = catalog;
            this.catalog.onChange.register((_) => this.onChanged.trigger(undefined)); 
        }

        public getCatalog() {
            return this.catalog.get();
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

        public getFilters(){ 
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
    }

    interface SelectionState {
        mode: SelectionMode;
        filters: any;
    }

    export class Selection extends React.Component<SelectionProps, SelectionState> {
        public onFilterChanged: Event<string> = new Event<string>();

        constructor(props: SelectionProps) {
            super(props);

            this.props.store.onChanged.register(_ => this.setState({ mode: this.state.mode, filters: this.props.store.getFilters() }));

            this.state = { mode: SelectionMode.Smart, filters: this.props.store.getFilters() };
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
                        ? <SmartFilter catalog={this.props.store.getCatalog()} 
                                       onChanged={([name, filters]) => this.filtersChanged(name, filters)} />
                        : <ManualSelection catalog={this.props.store.getCatalog()}
                                           onChanged={([name, filters]) => this.filtersChanged(name, filters)} /> }
                </section>
            );
        } 

        private filtersChanged(name, filters) {
            this.setState({ mode: this.state.mode, filters: filters });
            this.onFilterChanged.trigger(name);
        }

        public getFilters() {
            return this.props.store.getFilters();
        }

        private switchMode(mode: SelectionMode) {
            this.setState({mode: mode, filters: this.state.filters });
            this.onFilterChanged.trigger("");
        }
    }


    export function installSelection(el, store):Selection {
        return ReactDOM.render(<Selection store={store} />, el) as Selection;
    }
}