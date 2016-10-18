/// <reference path="../../vendor/react.d.ts" />

/// <reference path="strings.ts" />

module manticore.ui.results {
    "use strict";
    import _ = manticore.ui.strings._; 

    interface ResultsProps {
        
    }

    interface ResultsState {
        stale: boolean;
        party?: data.IParty; 
        allocs: data.GroupedEncounters;
        show: number;
    }

    export class Results extends React.Component<ResultsProps, ResultsState> {
        constructor(props: ResultsProps) {
            super(props);

            this.setState({
                stale: true,
                party: undefined,
                allocs: [],
                show: 100
            });
        }

        public markResultsAsOutOfDate() {
        }

        public render() {
            return (
                <section className="results">
                    <header>
                        <h1>{ _("Encounters") }</h1>
                        <p>{ _("[results summary]") }</p>
                    </header>
                    <div className="button generate">{_("generate encounters") }</div>
                </section>
            );

        }
    }

    export function installResults(el):Results {
        return ReactDOM.render(<Results />, el) as Results;
    }
}