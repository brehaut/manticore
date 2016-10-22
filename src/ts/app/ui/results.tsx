/// <reference path="../../vendor/react.d.ts" />

/// <reference path="strings.ts" />
/// <reference path="paginator.tsx" />

module manticore.ui.results {
    "use strict";
    import _ = manticore.ui.strings._; 
    import Paginator = manticore.ui.paginator.Paginator;

    function Allocation(props: { alloc: data.Allocation }) {
        const alloc = props.alloc;
        const className = `C allocation ${alloc.monster.size}`;

        return (
            <div className={className}>
                <div className="kind">
                    { _(alloc.monster.kind) }
                    <span className="level">{ alloc.monster.level }</span>
                    <span className="book">{ alloc.monster.book }</span>
                </div>
                <em>{ _(alloc.monster.name) }</em>
                <span className="number">{ alloc.num }</span>
            </div>
        );
    }


    function AbbreviatedAllocation(props: { alloc: data.Allocation }) {
        const alloc = props.alloc;
        const className = `C allocation -abbreviated`;

        return (
            <div className={className}>                    
                <em>{ _(alloc.monster.name) }</em>
                <span className="number">{ alloc.num }</span>
            </div>
        );
    }


    class AllocationGroup extends React.Component<{ encounters: data.Encounters }, {open: boolean}> {
        constructor (props: { encounters: data.Encounters }) {
            super(props);

            this.state = {open:false};
        }

        public render() {
            const encounters = this.props.encounters;
           
            if (encounters.length === 1) {
                return <li className="C encounter -single">{ encounters[0].map(alloc => <Allocation alloc={alloc} />) }</li>;
            }

            return (
                <li className={`C encounter -multiple ${this.state.open ? "-open" : ""}`}>
                    <div className="stereotype"
                         onClick={_ => this.setState({open: !this.state.open}) }>
                        { encounters[0].map(alloc => <Allocation alloc={alloc} />) }
                    </div>

                    <em>{template(_("[{n} variations.]"), {n: encounters.length - 1})}</em>

                    <ul className="variants">
                        { encounters.slice(1).map(enc => 
                            <li>
                                { enc.map(alloc => <AbbreviatedAllocation alloc={alloc} />) }
                            </li>
                        )}
                    </ul>
                </li>
            );
        } 
    }




    interface ResultsProps {
        onRequestGenerate?:()=>void;
        generatedEncounters?: data.GroupedEncounters;
        party?: data.IParty; 
    }

    interface ResultsState {
        stale: boolean;
        allocs: data.GroupedEncounters;
        show: number;
    }

    export class Results extends React.Component<ResultsProps, ResultsState> {
        public onRequestGenerate = new Event<null>();


        constructor(props: ResultsProps) {
            super(props);

            this.state = {
                stale: true,
                allocs: [],
                show: 100,
            };
        }

        public render() {           
            const allocs = (this.props.generatedEncounters || []);
            const party = this.props.party || { level: 0, size: 0 };

            return (
                <section className="results">
                    <header>
                        <h1>{ _("Encounters") }</h1>
                        <p>{ _("[results summary]") }</p>
                    </header>

                    <div className="button generate" onClick={ (_) => this.generateClicked() }>{_("generate encounters") }</div>

                    <section className="C encounters">
                        <header>
                            <h1>{ _("Possible encounters") }</h1>
                            <p>{ template(_("{count} encounters for {num} level {level} characters."),
                                          {count: this.props.generatedEncounters ? this.props.generatedEncounters.length : 0,
                                           num: party.size,
                                           level: party.level}) }
                            </p>
                        </header>

                        <Paginator pageSize={this.state.show} data={allocs} 
                                   render={encounter => <AllocationGroup encounters={ encounter }/>}>
                        </Paginator>
                    </section>
                </section>
            );
        }

        private generateClicked() {
            this.onRequestGenerate.trigger(null);
            if (this.props.onRequestGenerate) this.props.onRequestGenerate();
        }
    }
}