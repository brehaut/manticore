/// <reference path="../../vendor/react.d.ts" />

/// <reference path="strings.ts" />
/// <reference path="attribute-filter.tsx" />

module manticore.ui.filters {
    "use strict";    
    import _ = manticore.ui.strings._; 



    interface FilterSelections  {
        name: string[];
    }

    interface ManualSelectionState {
        catalog: bestiary.Bestiary;
        counts: any;
    }

    interface ManualSelectionProps {
        catalog: bestiary.Bestiary;
        filterSelections: FilterSelections
        onChanged?: (v:[string, {[index: string]: string[]}]) => void;
    }


    export class ManualSelection extends React.Component<ManualSelectionProps, ManualSelectionState> {
        public onChanged = new Event<[string, string[]]>();

        constructor(props: ManualSelectionProps) {
            super(props);

            this.state = {
                catalog: props.catalog,
                counts: {}
            };
        }

        public render() {
            const catalog = this.state.catalog;
            const filterSelections = this.props.filterSelections;
            const counts = this.state.counts;

            return (
                <div class="filters">
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

        private filterChanged(filterName: string, selectedAttrs: string[]) {
            const sels = {};
            const old = this.props.filterSelections;
            for (var k in old) if (old.hasOwnProperty(k)) {
                sels[k] = old[k];
            }
            sels[filterName] = selectedAttrs;

            this.onChanged.trigger([filterName, selectedAttrs]);
            if (this.props.onChanged) this.props.onChanged([filterName, sels as any]);
        } 
    }
}