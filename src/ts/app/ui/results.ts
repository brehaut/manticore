/// <reference path="../../common/data.ts" />
/// <reference path="strings.ts" />
/// <reference path="dom.ts" />
/// <reference path="common.ts" />
/// <reference path="results.tsx" />


module manticore.ui {
    "use strict";    
    var _ = strings._;

    export class ResultsView {
        public onRequestGenerate = new Event<null>();

        private reactResults: results.Results;

        constructor (private parent:HTMLElement) {
            this.createElements();
        }

        public markResultsAsOutOfDate() {
            this.reactResults.markResultsAsOutOfDate();
        }

        public displayResults(party: data.IParty, allocs: data.GroupedEncounters) {
            this.reactResults.displayResults(party, allocs);
        }

        private createElements() {
            const container = document.createElement("div");
            this.parent.appendChild(container);

            this.reactResults = results.installResults(container);
            this.reactResults.onRequestGenerate.register(_ => this.onRequestGenerate.trigger(null));
        }
    }
}