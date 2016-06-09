/// <reference path="strings.ts" />
/// <reference path="../vendor/react.d.ts" />

module manticore.ui.selection {
    import _ = manticore.ui.strings._; 

    function checkbox(key: string, selected: boolean) {
        return (
            [
                <input type="checkbox" name={key} checked={selected}/>,
                <label for={key}>{key}</label>
            ]
        );                
    }

    class CheckboxList extends React.Component<{attributes: string[], data: AttributeFilterState, onToggle?:(key: string) => void}, any> {
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
                        const selected = this.props.data.selected[key] || false;

                        return <li className={classname} onClick={() => this.handleClick(key)}>
                            {checkbox(k, selected)} 
                            <span className="count">{count}</span>
                        </li>;
                    })}
            </ul>;
        }

        private handleClick(key: string) {
            if (!this.props.onToggle) return;
            this.props.onToggle(key);
        }
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
        public onChanged = new Event<string[]>();

        constructor(props: AttributeFilterProps) {
            super(props);
            this.state = { counts: {}, selected: {} };
        }

        public render() { 
            const classname = `C attribute-filter -${this.props.name.toLowerCase().replace(" ", "-")} ${this.anySelected() ? "active" : ""}`;
            
            return <div className={classname}>
                <header>
                    <h2>{this.props.name} <a className="reset" onClick={() => this.clearAll()}>{_("[reset]")}</a></h2>
                </header>

                <CheckboxList attributes={this.props.attributes} 
                              data={this.state} 
                              onToggle={ (key: string) => this.toggleAttribute(key) } />
            </div>;
        }

        public updateCounts(counts: {[index: string]: number}) {
            this.setState({counts: counts, selected: this.state.selected});
        }

        private calculateSelected(selectedMapping: {[index: string]: boolean}): string[] {
            const attrs = [];

            for (var k in selectedMapping) if (selectedMapping.hasOwnProperty(k)) {
                if (selectedMapping[k]) attrs.push(k);
            }

            return attrs;
        }

        public getSelectedAttributes(): string[] {
            return this.calculateSelected(this.state.selected);
        }

        private clearAll() {
            this.setState({counts: this.state.counts, selected: {}});
            this.onChanged.trigger([]);
        }

        private anySelected(): boolean {
            const s = this.state.selected;
            for (var k in s) if (s.hasOwnProperty(k)) {
                if (s[k]) return true;
            }
            return false;
        }

        private toggleAttribute(key: string) {
            const oldSelected = this.state.selected;
            const selected:{[index: string]: boolean} = {};
            for (var k in oldSelected) if (oldSelected.hasOwnProperty(k)) {
                selected[k] = oldSelected[k];
            }
            
            selected[key] = selected.hasOwnProperty(key) ? !selected[key] : true;

            this.setState({counts: this.state.counts, selected: selected});
            
            this.onChanged.trigger(this.calculateSelected(selected));
        } 
    }

    export function install(el, props):AttributeFilter {
        return ReactDOM.render(<AttributeFilter name={props.name} attributes={props.attributes} />, el) as AttributeFilter;
    }
}