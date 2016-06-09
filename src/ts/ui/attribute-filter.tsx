/// <reference path="strings.ts" />
/// <reference path="../vendor/react.d.ts" />

module manticore.ui.filters {
    import _ = manticore.ui.strings._; 


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
                            <input type="checkbox" name={k} checked={selected} onClick={() => this.handleClick(key)}/>
                            <label for={k}>{key}</label>
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
        selected?: string[];
        onChanged?: (attrs: string[]) => void;
        counts?: any;
    }

    interface AttributeFilterState {
        counts: {[index: string]: number},
        selected: {[index: string]: boolean}
    }

    export class AttributeFilter extends React.Component<AttributeFilterProps, AttributeFilterState> {
        public onChanged = new Event<string[]>();

        constructor(props: AttributeFilterProps) {
            super(props);

            this.state = this.calculateStateFromProps(props);
        }

        private calculateStateFromProps(props: AttributeFilterProps): AttributeFilterState {
            const selected:{[index: string]: boolean} = {};
            (this.props.selected || []).forEach(attr => selected[attr] = true);
            return { counts: this.props.counts || {}, selected: selected };
        }

        public componentWillReceiveProps(props: AttributeFilterProps) {
            this.setState(this.calculateStateFromProps(props));
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
            this.triggerChanged([]);
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

            this.triggerChanged(this.calculateSelected(selected));
        } 

        private triggerChanged(attrs: string[]) {
            if (this.props.onChanged) this.props.onChanged(attrs);
            this.onChanged.trigger(attrs);
        }
    }

    export function install(el, props):AttributeFilter {
        return ReactDOM.render(<AttributeFilter name={props.name} attributes={props.attributes} />, el) as AttributeFilter;
    }
}