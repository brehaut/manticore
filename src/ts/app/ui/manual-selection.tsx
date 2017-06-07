/// <reference path="../../vendor/react.d.ts" />

/// <reference path="strings.ts" />
/// <reference path="text.ts" />
/// <reference path="attribute-filter.tsx" />

module manticore.ui.filters {
    "use strict";    
    import _ = manticore.ui.strings._; 



    interface FilterSelections  {
        name: string[];
    }

    interface ManualSelectionState {
        catalog: bestiary.Bestiary;
    }

    interface ManualSelectionProps {
        catalog: bestiary.Bestiary;
        filterSelections: FilterSelections
        onChanged?: (v:[string, {[index: string]: string[]}]) => void;
        counts: any;
    }


    export class ManualSelection extends React.Component<ManualSelectionProps, ManualSelectionState> {
        constructor(props: ManualSelectionProps) {
            super(props);

            this.state = {
                catalog: props.catalog,
            };
        }

        public render() {
            const catalog = this.state.catalog;
            const filterSelections = this.props.filterSelections;
            const counts = this.props.counts;

            return (
                <div className="filters">
                    <header>
                        <p>{_("[pick monsters]")}</p>
                    </header>

                    <div>
                        <AttributeFilter name="By Name" 
                                         attributes={catalog.allNames().sort(text.compareText)} 
                                         selected={filterSelections.name}
                                         counts={counts.names}
                                         onChanged={(attrs) => this.filterChanged("name", attrs)} />
                    </div>
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