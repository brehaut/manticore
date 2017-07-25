"use strict";
import * as React from "react";

import { _ } from "./strings";
import { Paginator } from "./paginator";
import * as data from "../../common/data";

function Allocation(props: { alloc: data.Allocation }) {
    const alloc = props.alloc;
    const className = `C allocation ${alloc.monster.size}`;

    return (
        <div className={className}>
            <div className="kind">
                { _(alloc.monster.kind) }
                <span className="level">{ alloc.monster.level }</span>
                <span className="book">{ alloc.monster.book } {_("pg.")} { alloc.monster.pageNumber }</span>
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
                <div className="stereotype">
                    { encounters[0].map(alloc => <Allocation alloc={alloc} />) }
                </div>

                <em>
                    <a href="#" onClick={e => {this.setState({open: !this.state.open}); e.preventDefault(); } }>
                        {_`[${encounters.length - 1} variations.]`}
                    </a>
                </em>

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
            <section className="C results">
                <header>
                    <h1>{ _`Encounters` }</h1>
                    <p>{ _`[results summary]` }</p>
                </header>

                <div className="button generate" onClick={ (_) => this.generateClicked() }>{_`generate encounters` }</div>

                <section className="C encounters">
                    <header>
                        <h1>{ _`Possible encounters` }</h1>
                        <p>{ 
                            _`${this.props.generatedEncounters 
                                    ? this.props.generatedEncounters.length 
                                    : 0} encounters for ${party.size} level ${party.level} characters.`
                        }
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
        if (this.props.onRequestGenerate) this.props.onRequestGenerate();
    }
}
