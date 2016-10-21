/// <reference path="../../vendor/react.d.ts" />

/// <reference path="strings.ts" />
/// <reference path="attribute-filter.tsx" />

module manticore.ui.filters {
    "use strict";    
    import _ = manticore.ui.strings._; 

    interface FilterSelections  {
        sources: string[];
        size: string[];
        kind: string[];
        attributes: string[];
    }

    interface SmartFilterState {
     
    }

    interface SmartFilterProps {
        filterSelections: FilterSelections;
        catalog: bestiary.Bestiary;
        counts: any;
        totalSelectedCount: number;
        onChanged?: (v:[string, {[index: string]: string[]}]) => void;
    }


    export class SmartFilter extends React.Component<SmartFilterProps, SmartFilterState> {
        constructor(props: SmartFilterProps) {
            super(props);
        }

        public render() {
            const catalog = this.props.catalog;
            const filterSelections = this.props.filterSelections;
            const counts = this.props.counts;

            return (
                <div class="filters">
                    <header>
                        <p>{_("[filter summary]")}</p>
                    </header>

                    <div>
                        <AttributeFilter name="Sources" 
                                         attributes={catalog.allSources()} 
                                         selected={filterSelections.sources}
                                         counts={counts.sources}
                                         onChanged={(attrs) => this.filterChanged("sources", attrs)} />
 
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

                    <div class="selection-count">{_("Number selected ")} { this.props.totalSelectedCount }</div>
                </div>
            );
        }


        private filterChanged(filterName: string, selectedAttrs: string[]) {
            const sels:{[index:string]:string[]} = {};
            const old = this.props.filterSelections;
            for (var k in old) if (old.hasOwnProperty(k)) {
                sels[k] = (old as any)[k];
            }
            sels[filterName] = selectedAttrs;

            if (this.props.onChanged) this.props.onChanged([filterName, sels as any]);
        }        
    }
}