/// <reference path="../../vendor/react.d.ts" />

/// <reference path="strings.ts" />

module manticore.ui.party {
    "use strict";

    import _ = manticore.ui.strings._; 


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

        public onChangeHandler(e) {
            const computedValue = +e.target.value;    

            if (this.props.onChanged) {
                this.props.onChanged(computedValue);
            }
        }
    } 



    interface PartyProps {
        worker: model.DataAccessWorker
    }

    interface PartyState {
        size: number;
        level: number;
    }

    export class Party extends React.Component<PartyProps, PartyState> {
        constructor(props: PartyProps) {
            super(props);
            
            this.state = { size: 4, level: 2};
            this.props.worker.addEventListener("message", (ev) => {
                if (messaging.dataAccess.isPartyMessage(ev.data) && messaging.dataAccess.isPartyData(ev.data)) {
                    this.storeChanged(ev.data.party) ;
                }
            });
            this.props.worker.postMessage(messaging.dataAccess.partyGetMessage());
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

                    <NumericInput label={_("Party size")} value={this.state.size} max={10} 
                                  onChanged={(v) => this.sizeChanged(v)} />
                    <NumericInput label={_("Party level")} value={this.state.level} max={10}
                                  onChanged={(v) => this.levelChanged(v)} />
                </section>
            )
        }

        public getPartyInfo(): data.IParty {
            return { size: this.state.size, level: this.state.level };
        }

        private storeChanged(data: data.IParty) {
            this.setState(data);
        }

        private sizeChanged(newSize: number) {
            const partyInfo = { size: newSize, level: this.state.level };
            this.props.worker.postMessage(messaging.dataAccess.partyPutMessage(partyInfo));
        }

        private levelChanged(newLevel: number) {
            const partyInfo = { size: this.state.size, level: newLevel };
            this.props.worker.postMessage(messaging.dataAccess.partyPutMessage(partyInfo));
        }
    }


    export function installParty(el, worker: model.DataAccessWorker):Party {
        return ReactDOM.render(<Party worker={worker} />, el) as Party;
    }
}