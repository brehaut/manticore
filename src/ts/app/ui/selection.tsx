import * as React from "react";

import { _ } from "./strings";
import { Event } from "common/event";
import { bestiary } from "common/";

import { SmartFilter } from "./smart-filters";
import { ManualSelection } from "./manual-selection";


export class FilterStore {
    public onChanged = new Event<void>();

    private filters:any = {};

    public getFilters() { 
        return this.filters;
    }

    public updateFilters(filters: any) {
        this.filters = filters;
        this.onChanged.trigger(undefined);
    }
}


enum SelectionMode {
    Smart,
    Manual
}

interface SelectionProps {
    store: FilterStore;
    catalog: bestiary.Bestiary;
    counts: any;
    totalSelectedCount: number;
}

interface SelectionState {
    mode: SelectionMode;
    filters: any;
}

export class Selection extends React.Component<SelectionProps, SelectionState> {
    constructor(props: SelectionProps) {
        super(props);

        this.props.store.onChanged.register(({}) => {
            this.setState({ filters: this.props.store.getFilters()});
        });

        this.state = { 
            mode: SelectionMode.Smart, 
            filters: this.props.store.getFilters(), 
        };
    }


    public render() {
        const mode = this.state.mode;

        return (
            <section className="selection">
                <header>
                    <h1>{_`Filter monsters`}</h1>
                    <p>
                        {_`[select monsters]`}
                    </p>
                </header>

                <div>
                    <p>
                        {_`[selection mode]` + " "}
                        <a className={`mode-switch -filters ${mode === SelectionMode.Smart ? "-active" : ""}`}
                            onClick={() => this.switchMode(SelectionMode.Smart)}>
                            {_`[use filters]`}
                        </a>
                        {" "}
                        <a className={`mode-switch -filters ${mode === SelectionMode.Manual ? "-active" : ""}`}
                            onClick={() => this.switchMode(SelectionMode.Manual)}>
                            {_`[use pickers]`}
                        </a>
                    </p>
                </div>

                { this.state.mode === SelectionMode.Smart 
                    ? <SmartFilter catalog={this.props.catalog} 
                                    filterSelections={this.state.filters}
                                    counts={ this.props.counts }
                                    onChanged={([name, filters]) => this.filtersChanged(name, filters)} 
                                    totalSelectedCount= { this.props.totalSelectedCount } />
                    : <ManualSelection catalog={this.props.catalog}
                                        filterSelections={this.state.filters} 
                                        counts={ this.props.counts }
                                        onChanged={([name, filters]) => this.filtersChanged(name, filters)} /> }
            </section>
        );
    } 

    private filtersChanged(name: string, filters: any) {
        this.props.store.updateFilters(filters); // the store will trigger an update event that will be propagated to setState
    }

    private switchMode(mode: SelectionMode) {
        this.setState({mode: mode});
    }
}
