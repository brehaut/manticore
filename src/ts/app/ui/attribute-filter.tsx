/// <reference path="strings.ts" />
/// <reference path="../../vendor/react.d.ts" />

module manticore.ui.filters {
    "use strict";    
    import _ = manticore.ui.strings._; 


    class CheckboxList extends React.Component<{attributes: string[], data: AttributeFilterState, onToggle?:(key: string) => void}, any> {
        constructor(props: {attributes: string[], data: AttributeFilterState}) {
            super(props);
        }

        public render () {
            // TODO: toggle click on 
                return <ul>
                    {this.props.attributes.map((key) => {
                        const k = key.toString();
                        const count = this.props.data.counts[key] || 0;
                        const classname = count > 0 ? "viable" : "";
                        const selected = this.props.data.selected[key] || false;

                        return <li className={classname} onClick={e => this.handleClick(e, key)}> 
                            <input type="checkbox" name={k} checked={selected} onClick={(e) => this.handleClick(e, key)}/>
                            <label htmlFor={k}>{key}</label>
                            <span className="count">{count}</span>
                        </li>;
                    })}
            </ul>;
        }

        private handleClick(e: React.MouseEvent, key: string) {
            e.preventDefault();
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

    export class AttributeFilter extends React.Component<AttributeFilterProps, undefined> {
        constructor(props: AttributeFilterProps) {
            super(props);
        }

        private calculateStateFromProps(props: AttributeFilterProps): AttributeFilterState {
            const selected:{[index: string]: boolean} = {};
            (this.props.selected || []).forEach(attr => selected[attr] = true);
            return { counts: this.props.counts || {}, selected: selected };
        }


        public render() { 
            const state = this.calculateStateFromProps(this.props);
            const classname = `C attribute-filter -${this.props.name.toLowerCase().replace(" ", "-")} ${this.anySelected(state.selected) ? "active" : ""}`;
            
            return <div className={classname}>
                <header>
                    <h2>{this.props.name} <a className="reset" onClick={() => this.clearAll()}>{_("[reset]")}</a></h2>
                </header>

                <CheckboxList attributes={this.props.attributes} 
                              data={state} 
                              onToggle={ (key: string) => this.toggleAttribute(key) } />
            </div>;
        }

        private calculateSelected(selectedMapping: {[index: string]: boolean}): string[] {
            const attrs:string[] = [];

            for (var k in selectedMapping) if (selectedMapping.hasOwnProperty(k)) {
                if (selectedMapping[k]) attrs.push(k);
            }

            return attrs;
        }


        private clearAll() {
            this.triggerChanged([]);
        }

        private anySelected(selected: {[index:string]:boolean}): boolean {
            for (var k in selected) if (selected.hasOwnProperty(k)) {
                if (selected[k]) return true;
            }
            return false;
        }

        private toggleAttribute(key: string) {
            const oldSelected = this.calculateStateFromProps(this.props).selected;
            const selected:{[index: string]: boolean} = {};
            for (var k in oldSelected) if (oldSelected.hasOwnProperty(k)) {
                selected[k] = oldSelected[k];
            }
            
            selected[key] = selected.hasOwnProperty(key) ? !selected[key] : true;

            this.triggerChanged(this.calculateSelected(selected));
        } 

        private triggerChanged(attrs: string[]) {
            if (this.props.onChanged) this.props.onChanged(attrs);
        }
    }
}