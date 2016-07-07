/// <reference path="../vendor/react.d.ts" />

/// <reference path="strings.ts" />

module manticore.ui.party {
    "use strict";

    import _ = manticore.ui.strings._; 


    interface NumericInputProps {
        label: string;
        value: number;
        max: number;
    }

    class NumericInput extends React.Component<NumericInputProps, any> {
        constructor(props: NumericInputProps) {
            super(props);

            this.state = {value: props.value};
        }

        public render() {
            return (
                <div className="field">
                    <label>{this.props.label}</label>
                    <input type="number" min="1" max={this.props.max} 
                           value={this.state.value} 
                           onChange={(e) => this.onChangeHandler(e)} 
                           />
                </div>
            )
        }

        public onChangeHandler(e) {
            const computedValue = +e.target.value;    
            this.setState({value: computedValue });
        }
    } 



    interface PartyProps {

    }

    interface PartyState {
        
    }

    export class Party extends React.Component<PartyProps, PartyState> {
        constructor(props: PartyProps) {
            super(props);
        }

        public render() {
            // this.el = ui.sectionMarkup("Party", "party", "[party summary]", []);
            
            //this.size = this.labeledNumericField(this.el, _("Party size"), "size", 4, 10);
            //this.level = this.labeledNumericField(this.el, _("Party level"), "level", 2, 10);

            return (
                <section className="clearfix party">
                    <header>
                        <h1>{_("Party")}</h1>
                        <p>
                            {_("[party summary]")}
                        </p>
                    </header>

                    <NumericInput label={_("Party size")} value={4} max={10} />
                    <NumericInput label={_("Party level")} value={2} max={10} />
                </section>
            )
        }
    }


    export function installParty(el):Party {
        return ReactDOM.render(<Party />, el) as Party;
    }
}