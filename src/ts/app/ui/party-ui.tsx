"use strict";
import * as React from "react";

import { _ } from "./strings";
import * as model from "../data-access-worker";
import * as data from "../../common/data";
import { dataAccess } from "../../common/messaging";

interface NumericInputProps {
    label: string;
    value: number;
    max: number;
    onChanged?: (v:number) => void;
}

class NumericInput extends React.Component<NumericInputProps, any> {
    constructor(props: NumericInputProps) {
        super(props);
    }

    public render() {
        const dataId = `${this.props.label}_options`; 

        return (
            <div className="field">
                <label>{this.props.label}</label>
                <input type="range" step="1" min="1" max={this.props.max} 
                        value={this.props.value.toString()} 
                        onChange={(e) => this.onChangeHandler(e)} 
                        list={dataId}
                        />
                <datalist id={dataId}>
                        {[1,2,3,4,5,6,7,8,9,10].map(v => <option value={v.toString()} />)}
                    </datalist>
                <span>{this.props.value}</span>
            </div>
        )
    }

    public onChangeHandler(e:React.FormEvent<{}>) {
        const computedValue = +(e.target as any).value;    

        if (this.props.onChanged) {
            this.props.onChanged(computedValue);
        }
    }
} 



interface PartyProps {
    worker: model.DataAccessWorker,
    party: data.IParty
}

interface PartyState {

}

export class Party extends React.Component<PartyProps, PartyState> {
    constructor(props: PartyProps) {
        super(props);        
    }

    public render() {
        return (
            <section className="party">
                <header>
                    <h1>{_("Party")}</h1>
                    <p>
                        {_("[party summary]")}
                    </p>
                </header>

                <NumericInput label={_("Party size")} value={this.props.party.size} max={10} 
                                onChanged={(v) => this.sizeChanged(v)} />
                <NumericInput label={_("Party level")} value={this.props.party.level} max={10}
                                onChanged={(v) => this.levelChanged(v)} />
            </section>
        )
    }

    private sizeChanged(newSize: number) {
        const partyInfo = { size: newSize, level: this.props.party.level };
        this.props.worker.postMessage(dataAccess.partyPutMessage(partyInfo));
    }

    private levelChanged(newLevel: number) {
        const partyInfo = { size: this.props.party.size, level: newLevel };
        this.props.worker.postMessage(dataAccess.partyPutMessage(partyInfo));
    }
}
