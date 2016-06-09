/// <reference path="../vendor/react.d.ts" />

/// <reference path="strings.ts" />
/// <reference path="attribute-filter.tsx" />

module manticore.ui.filters {
    import _ = manticore.ui.strings._; 

    interface FilterSelections  {
        source: string[];
        size: string[];
        kind: string[];
        attributes: string[];
    }

    interface SmartFilterState {
        catalog: bestiary.Bestiary;
        filterSelections: FilterSelections
        counts: any;
    }

    export class SmartFilter extends React.Component<{catalog: Atom<bestiary.Bestiary>}, SmartFilterState> {
        public onChanged = new Event<[string, string[]]>();

        constructor(props: {catalog: Atom<bestiary.Bestiary>}) {
            super(props);

            this.state = {
                catalog: props.catalog.get(),
                filterSelections: {
                    source: [],
                    size: [],
                    kind: [],
                    attributes: []
                },
                counts: {}
            };

            props.catalog.onChange.register((catalog) => this.setState({
                catalog: catalog, 
                filterSelections: this.state.filterSelections,
                counts: this.state.counts
            }));
        }

        public render() {
            const catalog = this.state.catalog;
            const filterSelections = this.state.filterSelections;
            const counts = this.state.counts;

            return (
                <div class="filters clearfix">
                    <header>
                        <p>{_("[filter summary]")}</p>
                    </header>

                    <div>
                        <AttributeFilter name="Sources" 
                                         attributes={catalog.allSources()} 
                                         selected={filterSelections.source}
                                         counts={counts.sources}
                                         onChanged={(attrs) => this.filterChanged("source", attrs)} />
 
                        <AttributeFilter name="Size" 
                                         attributes={catalog.allSizes()}
                                         selected={filterSelections.size} 
                                         counts={counts.sizes}
                                         onChanged={(attrs) => this.filterChanged("size", attrs)} />
                        <AttributeFilter name="Role" 
                                         attributes={catalog.allKinds()} 
                                         selected={filterSelections.kind}
                                         counts={counts.kinds}
                                         onChanged={(attrs) => this.filterChanged("kind", attrs)} />
                        <AttributeFilter name="Tags" 
                                         attributes={catalog.allAttributes().sort()}
                                         selected={filterSelections.attributes}
                                         counts={counts.attributes} 
                                         onChanged={(attrs) => this.filterChanged("attributes", attrs)} />
                    </div>

                    <div class="selection-count">{_("Number selected ")} </div>
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
        }        
    }


    export function installSmartFilter(el, atom):SmartFilter {
        return ReactDOM.render(<SmartFilter catalog={atom} />, el) as SmartFilter;
    }
}