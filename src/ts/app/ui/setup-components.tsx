/// <reference path="../../vendor/react.d.ts" />

/// <reference path="strings.ts" />
/// <reference path="party-ui.tsx" />
/// <reference path="selection.tsx" />


module manticore.ui.setup {
    import _ = manticore.ui.strings._; 

    import Party = party.Party;
    import Selection = filters.Selection;


    export interface SetupProps {
        catalog: Atom<bestiary.Bestiary>;
    }

    export interface SetupState {

    }

    export class SetupComp extends React.Component<SetupProps, SetupState> {
        private worker = manticore.model.partyWorker(); 
        private store:filters.FilterStore;
        
        constructor (props: SetupProps) {
            super(props);
            new filters.FilterStore(props.catalog)
        }

        public render() {
            return (
                <div>
                    <Party worker={this.worker} />
                    <Selection store={this.store} />
                </div>
            );
            
        }
    }
}