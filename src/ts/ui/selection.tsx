/// <reference path="strings.ts" />
/// <reference path="../vendor/react.d.ts" />

module manticore.ui.selection {
    import _ = manticore.ui.strings._; 

    function checkbox(key: string) {
        return (
            [
                <input type="checkbox" name={key} />,
                <label for={key}>{key}</label>
            ]
        );                
    }

    class CheckboxList extends React.Component<{attributes: string[], data: AttributeFilterState}, any> {
        constructor(props: {attributes: string[], data: AttributeFilterState}) {
            super(props);
        }

        public render () {
            // TODO: toggle click on 
                return <ul className="clearfix">
                    {this.props.attributes.map((key) => {
                        const k = key.toString();
                        const count = this.props.data.counts[key] || 0;
                        const classname = count > 0 ? "viable" : "";
                        return <li data-name={k} className={classname}>{checkbox(k)} <span className="count">{count}</span></li>;
                    })}
            </ul>;
        }
    }

    export function header(name:string){
        return (
            <header>
                <h2>{name} <a className="reset">{_("[reset]")}</a></h2>
            </header>
        );
    } 

 
    export interface AttributeFilterProps {
        name: string;
        attributes: string[];
    }

    interface AttributeFilterState {
        counts: {[index: string]: number},
        selected: {[index: string]: boolean}
    }

    export class AttributeFilter extends React.Component<AttributeFilterProps, AttributeFilterState> {
        constructor(props: AttributeFilterProps) {
            super(props);
            this.state = { counts: {}, selected: {} };
        }

        public render() { 
            const classname = `C attribute-filter -${this.props.name.toLowerCase().replace(" ", "-")}`;
            
            return <div className={classname}>
                {header(this.props.name)}
                <CheckboxList attributes={this.props.attributes} data={this.state} />
            </div>;
        }

        public updateCounts(counts: {[index: string]: number}) {
            this.setState({counts: counts, selected: this.state.selected});
        } 
    }

    export function install(el, props):AttributeFilter {
        return ReactDOM.render(<AttributeFilter name={props.name} attributes={props.attributes} />, el) as AttributeFilter;
    }
}