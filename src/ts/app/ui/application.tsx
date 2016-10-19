/// <reference path="../../common/data.ts" />
/// <reference path="strings.ts" />
/// <reference path="dom.ts" />
/// <reference path="common.ts" />
/// <reference path="party-ui.tsx" />
/// <reference path="selection.tsx" />
/// <reference path="results.tsx" />

module manticore.ui {
    "use strict";    
    var _ = strings._;


    interface ApplicationProps {
        dataAccess: model.DataAccessWorker; 
        allocator: data.Allocator;
    }

    interface ApplicationState {
        partyInfoCache: data.IParty;
        catalog: bestiary.Bestiary;
        filterStore: filters.FilterStore;
    }


    export class Application extends React.Component<ApplicationProps, ApplicationState> {
        private partyWorker = manticore.model.partyWorker()

        constructor(props: ApplicationProps) {
            super(props);

            this.state = {
                partyInfoCache: {size: 4, level: 2},
                catalog: bestiary.createBestiary({}),
                filterStore: new filters.FilterStore()
            };

            // temporary kludge
            this.partyWorker.onmessage = (message) => {
                this.setState({partyInfoCache: message.data} as ApplicationState);
            }
            this.partyWorker.postMessage(messaging.dataAccess.partyGetMessage());

            this.requestBestiary();
        }

        private requestBestiary() {
            const chan = new MessageChannel();
            chan.port2.onmessage = (message) => this.updateBestiary(message.data);
            this.props.dataAccess.postMessage(messaging.dataAccess.bestiaryGetMessage(), [chan.port1]);
        }

        private updateBestiary(message: messaging.dataAccess.BestiaryMessage) {
            if (messaging.dataAccess.isBestiaryData(message)) {
                this.setState({ catalog: bestiary.createBestiary(message.payload) } as ApplicationState);
            }
            else {
                console.warn("Unexpected message", message);
            }
        }

        private featureCounts():any {            
            return this.state.catalog.featureCounts(this.state.partyInfoCache,
                                                    this.state.filterStore.getFilters());
        }

        public render() {
            if (!this.state) {
                return <div className="loading">{ _("Loading...") }</div>;
            }
            return (
                <div>
                    <party.Party worker={ this.partyWorker } />
                    <filters.Selection 
                        store={ this.state.filterStore } 
                        catalog={ this.state.catalog } 
                        counts={ this.featureCounts() } />
                    <results.Results />
                </div>
            );
        }
    }

    export function installApplication(el, allocator: data.Allocator, dataAccess: model.DataAccessWorker):Application {
        return ReactDOM.render(<Application allocator={ allocator } dataAccess={ dataAccess } />, el) as Application;
    }
}