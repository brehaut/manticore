/// <reference path="../common/data.ts" />
/// <reference path="strings.ts" />
/// <reference path="dom.ts" />
/// <reference path="common.ts" />


module manticore.ui {
    var _ = strings._;

    export class ResultsView {
        private el: HTMLElement;
        private resultsEl: HTMLElement;
        private moreButton: HTMLElement;

        public onRequestGenerate = new Event<null>();

        private currentIndex: number;
        private pendingAllocations:data.GroupedEncounters;

        constructor (private parent:HTMLElement) {
            this.createElements();
            
            this._appendTo(this.parent);
        }

        private _appendTo(el:HTMLElement) {
            el.appendChild(this.el);
        }

        public markResultsAsOutOfDate() {
            this.resultsEl.classList.add("outofdate");
        }

        public displayResults(party: data.IParty, allocs: data.GroupedEncounters) {
            DOM.empty(this.resultsEl);
            
            this.resultsEl.appendChild(this.resultsSummary(party, allocs));
            this.resultsEl.classList.remove("outofdate");
            
            this.currentIndex = 0; 
            
            this.pendingAllocations = allocs;

            this.show100();
        }

        private allocationGroupMarkup(encounters: data.Encounters) {
            if (encounters.length === 1) {
                return encounters[0].map(al => this.allocationMarkup(al));
            }   
            else {
                const summary:Node[] = encounters[0].map(al => this.allocationMarkup(al, false));
                summary.push(DOM.ul({"style": "clear:left"}, encounters.map(enc => DOM.li({"class": "clearfix"}, enc.map(al => this.allocationMarkup(al))))));

                return [DOM.div({
                    "class": "allocation-group",
                },
                [
                    DOM.div({}, summary)
                ])];
            }                       
        }     

        private allocationMarkup(alloc: data.Allocation, showcount = true) {
            return DOM.div(
                {"class": "allocation " + alloc.monster.size},
                [
                    DOM.div({"class":"kind"},[
                        DOM.text(_(alloc.monster.kind)),
                        DOM.span({"class":"level"}, 
                                 [DOM.text(alloc.monster.level.toString())]),
                        DOM.span({"class":"book"}, 
                                 [DOM.text(alloc.monster.book)])
                    ]),
                    DOM.em({"class": "name"}, [
                        DOM.text(_(alloc.monster.name))
                    ]),
                    showcount ? DOM.span({"class": "number"}, [
                        DOM.text(" ×" + alloc.num.toString())
                    ]) : DOM.span({"class": "number"})
                ]
            );                           
        }       

        private resultsSummary(party: data.IParty, allocs: data.GroupedEncounters) {
            return DOM.header(
                {"class": "results-summary"},
                [
                    DOM.h1(null, [DOM.text(_("Possible encounters"))]),
                    DOM.p(null, [DOM.text(template(_("{count} encounters for {num} level {level} characters."),
                                                   {count: allocs.length,
                                                    num: party.size,
                                                    level: party.level}))])
                ]
            );
        }

        private show100() {
            const window = 100;           

            const allocs = this.pendingAllocations.slice(this.currentIndex, this.currentIndex + window);

            allocs.forEach(group => {
                this.resultsEl.appendChild(DOM.li(
                    {"class": "clearfix"}, 
                    this.allocationGroupMarkup(group)
                ));
            });

            this.currentIndex += window;

            if (this.currentIndex > this.pendingAllocations.length) {
                this.moreButton.style.display = "none";
            }
            else {
                this.moreButton.style.display = "inline-block";
            }
        }

        private createElements() {
            var clickGenerate = (e) => {
                this.onRequestGenerate.trigger(null);
                e.preventDefault();
                e.stopPropagation();
            };
            
            this.el = ui.sectionMarkup("Encounters", "results", "[results summary]", [
                DOM.div(
                    {
                        "class": "button generate",
                        
                        onclick: clickGenerate,
                    },
                    [
                        DOM.text(_("generate encounters"))
                    ])
            ]);

            this.resultsEl = DOM.ul({"class": "encounters"}, []);
            this.moreButton = DOM.div(
                {
                    "class":"button",

                    onclick: (e) => this.show100(),
                }, 
                [DOM.text(_("more"))]
            );
            this.moreButton.style.display = "none";

            this.el.appendChild(this.resultsEl);
            this.el.appendChild(this.moreButton);
        }
    }
}