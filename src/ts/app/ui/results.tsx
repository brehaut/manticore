/// <reference path="../../vendor/react.d.ts" />

/// <reference path="strings.ts" />

module manticore.ui.results {
    "use strict";
    import _ = manticore.ui.strings._; 

    class Allocation extends React.Component<{ alloc: data.Allocation, showCount?: boolean }, undefined> {
        public render() {
            const alloc = this.props.alloc;
            const className = `C allocation ${alloc.monster.size}`;


            return (
                <div className={className}>
                    <div className="kind">
                        { _(alloc.monster.kind) }
                        <span className="level">{ alloc.monster.level }</span>
                        <span className="book">{ alloc.monster.book }</span>
                    </div>
                    <em>{ _(alloc.monster.name) }</em>
                    {this.props.showCount !== false ? <span className="number">{ alloc.num }</span> : null}
                </div>
            );
        }
    }


    class AbbreviatedAllocation extends React.Component<{ alloc: data.Allocation }, undefined> {
        public render() {
            const alloc = this.props.alloc;
            const className = `C allocation -abbreviated`;

            return (
                <div className={className}>                    
                    <em>{ _(alloc.monster.name) }</em>
                    <span className="number">{ alloc.num }</span>
                </div>
            );
        }
    }


    class AllocationGroup extends React.Component<{ encounters: data.Encounters }, undefined> {
        public render() {
            if (this.props.encounters.length === 1) {
                return <li className="encounter -single">{ this.props.encounters[0].map(alloc => <Allocation alloc={alloc} />) }</li>;
            }
            return (
                <li className="encounter -multiple">
                    <div className="stereotype">
                        {this.props.encounters[0].map(alloc => <Allocation alloc={alloc} showCount={false}/>) }
                    </div>

                    <ul className="variants">
                        { this.props.encounters.map(enc => 
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
            const allocs = (this.props.generatedEncounters || []).slice(0, this.state.show);
            const party = this.props.party || { level: 0, size: 0 };

            return (
                <section className="results">
                    <header>
                        <h1>{ _("Encounters") }</h1>
                        <p>{ _("[results summary]") }</p>
                    </header>

                    <div className="button generate" onClick={ (_) => this.generateClicked() }>{_("generate encounters") }</div>

                    <section className="encounters">
                        <header>
                            <h1>{ _("Possible encounters") }</h1>
                            <p>{ template(_("{count} encounters for {num} level {level} characters."),
                                                   {count: allocs.length,
                                                    num: party.size,
                                                    level: party.level}) }
                            </p>
                        </header>

                        <ul className={ this.state && this.state.stale ? 'outofdate' : '' }>
                        { allocs.map(alloc => <AllocationGroup encounters={alloc} />) }
                        </ul>
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