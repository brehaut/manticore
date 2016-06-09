/// <reference path="../vendor/react.d.ts" />

/// <reference path="strings.ts" />
/// <reference path="attribute-filter.tsx" />

module manticore.ui.filters {
    import _ = manticore.ui.strings._; 



    interface FilterSelections  {
        name: string[];
    }

    interface ManualSelectionState {
        catalog: bestiary.Bestiary;
        filterSelections: FilterSelections
        counts: any;
    }

    interface ManualSelectionProps {
        catalog: bestiary.Bestiary;
        onChanged?: (v:[string, {[index: string]: string[]}]) => void;
    }


    export class ManualSelection extends React.Component<ManualSelectionProps, ManualSelectionState> {
        public onChanged = new Event<[string, string[]]>();

        constructor(props: ManualSelectionProps) {
            super(props);

            this.state = {
                catalog: props.catalog,
                filterSelections: { name: [] },
                counts: {}
            };
        }

        public render() {
            const catalog = this.state.catalog;
            const filterSelections = this.state.filterSelections;
            const counts = this.state.counts;

            return (
                <div class="filters clearfix">
                    <header>
                        <p>{_("[pick monsters]")}</p>
                    </header>

                    <div>
                        <AttributeFilter name="By Name" 
                                         attributes={catalog.allNames()} 
                                         selected={filterSelections.name}
                                         counts={counts.names}
                                         onChanged={(attrs) => this.filterChanged("name", attrs)} />
                    </div>
                </div>
            );
        }

        public getFilters():{[index: string]: string[]} {
            return this.state.filterSelections as any ;
        }

        public updateFilterCounts(filters: any) {
            this.setState({catalog: this.state.catalog, filterSelections: this.state.filterSelections, counts: filters})
        }

        private filterChanged(filterName: string, selectedAttrs: string[]) {
            const sels = {};
            const old = this.state.filterSelections;
            for (var k in old) if (old.hasOwnProperty(k)) {
                sels[k] = old[k];
            }
            sels[filterName] = selectedAttrs;

            this.setState({
                catalog: this.state.catalog, 
                filterSelections: sels as FilterSelections,
                counts: this.state.counts
            });

            this.onChanged.trigger([filterName, selectedAttrs]);
            if (this.props.onChanged) this.props.onChanged([filterName, sels as any]);
        } 
    }


    export function installManualSelection(el, atom):ManualSelection {
        return ReactDOM.render(<ManualSelection catalog={atom} />, el) as ManualSelection;
    }
}