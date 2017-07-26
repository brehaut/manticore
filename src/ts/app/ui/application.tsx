"use strict";    

import * as React from "react";
import * as ReactDOM from "react-dom";

import * as common from "common";
import { bestiary, data, messaging } from "../../../../build/types/common";
import { Allocator, IParty } from "common/data";


import { _ } from "./strings"; 
import * as strings from "./strings";
import { FilterStore, Selection } from "./selection";
import * as model from "../data-access-worker";
import { DataAccessWorker } from "../data-access-worker";
import { Party } from "./party-ui";
import { Results } from "./results";


interface ApplicationProps {
    dataAccess: DataAccessWorker; 
    allocator: Allocator;
}

interface ApplicationState {
    partyInfoCache: IParty;
    catalog: bestiary.Bestiary;
    filterStore: FilterStore;
    generatedEncounters?: data.GroupedEncounters; 
}


export class Application extends React.Component<ApplicationProps, ApplicationState> {
    constructor(props: ApplicationProps) {
        super(props);

        this.state = {
            partyInfoCache: {size: 1, level: 1},
            catalog: bestiary.createBestiary({}),
            filterStore: new FilterStore()
        };

        // kludge
        this.state.filterStore.onChanged.register(({}) => this.forceUpdate());

        // temporary kludge
        this.props.dataAccess.addEventListener("message", (message: any) => {
            if (messaging.dataAccess.isPartyMessage(message.data) && messaging.dataAccess.isPartyData(message.data)) {
                this.setState({partyInfoCache: message.data.party});
            }
        });
        this.props.dataAccess.postMessage(messaging.dataAccess.partyGetMessage());

        this.requestBestiary();
    }

    private requestBestiary() {
        const chan = new MessageChannel();
        chan.port2.onmessage = (message) => this.updateBestiary(message.data);
        this.props.dataAccess.postMessage(messaging.dataAccess.bestiaryGetMessage(), [chan.port1]);
    }

    private updateBestiary(message: messaging.dataAccess.BestiaryMessage) {
        if (messaging.dataAccess.isBestiaryData(message)) {
            this.setState({ catalog: bestiary.createBestiary(message.dataset) });
        }
        else {
            console.warn("Unexpected message", message);
        }
    }

    private featureCounts():any {            
        return this.state.catalog.featureCounts(this.state.partyInfoCache,
                                                this.state.filterStore.getFilters());
    }

    private getSelection() {
        const pred = data.predicateForFilters(this.state.filterStore.getFilters());
        return this.state.catalog.filteredBestiary(this.state.partyInfoCache, pred);
    }

    public render() {
        if (!this.state) {
            return <div className="loading">{ _`Loading...` }</div>;
        }
        return (
            <div>
                <Party worker={ this.props.dataAccess } 
                                party={ this.state.partyInfoCache } />
                <Selection 
                    store={ this.state.filterStore } 
                    catalog={ this.state.catalog } 
                    counts={ this.featureCounts() }
                    totalSelectedCount={ this.getSelection().length } />
                <Results 
                    generatedEncounters={this.state.generatedEncounters}
                    onRequestGenerate={() => this.generate() }
                    party={this.state.partyInfoCache} />
            </div>
        );
    }

    private generate() {
        const selection = this.getSelection();

        this.props.allocator(this.state.partyInfoCache,
                                selection)
            .then((alloc:data.GroupedEncounters) => this.setState({generatedEncounters: alloc}));
    }
}

export function installApplication(el: HTMLElement, allocator: data.Allocator, dataAccess: model.DataAccessWorker):Application {
    return (ReactDOM.render(<Application allocator={ allocator } dataAccess={ dataAccess } />, el) as any) as Application;
}
