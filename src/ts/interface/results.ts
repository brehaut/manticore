/// <reference path="../data.ts" />
/// <reference path="../strings.ts" />
/// <reference path="../dom.ts" />
/// <reference path="common.ts" />


module manticore.interface {
    var _ = strings._;

    export class ResultsView implements IView {
        private el: HTMLElement;
        private resultsEl: HTMLElement;
        private moreButton: HTMLElement;

        public onRequestGenerate: Event<void>;

        private currentIndex: number;
        private pendingAllocations

        constructor () {
            this.onRequestGenerate = new Event<void>();
            
            this.createElements();
        }

        public _appendTo(el:HTMLElement) {
            el.appendChild(this.el);
        }

        public markResultsAsOutOfDate() {
            this.resultsEl.classList.add("outofdate");
        }

        public displayResults(party: data.IParty, allocs: data.Allocation[][]) {
            DOM.empty(this.resultsEl);
            
            this.resultsEl.appendChild(this.resultsSummary(party, allocs));
            this.resultsEl.classList.remove("outofdate");
            
            this.currentIndex = 0;
            this.pendingAllocations = allocs;

            this.show100();
        }

        private allocationMarkup(alloc: data.Allocation) {
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
                    DOM.span({"class": "number"}, [
                        DOM.text(" ×" + alloc.num.toString())
                    ])
                ]
            );                           
        }       

        private resultsSummary(party: data.IParty, allocs: data.Allocation[][]) {
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
            var window = 100;           

            var allocs = this.pendingAllocations.slice(this.currentIndex, this.currentIndex + window);

            allocs.forEach(alloc => {
                this.resultsEl.appendChild(DOM.li(
                    {"class": "clearfix"}, 
                    alloc.map(al => this.allocationMarkup(al))
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
            
            this.el = interface.sectionMarkup("Encounters", "results", "[results summary]", [
                DOM.div(
                    {
                        "class": "button generate",
                        
                        onclick: clickGenerate,
                        ontouchend: clickGenerate
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
                    ontouchend: (e) => this.show100(),
                }, 
                [DOM.text(_("more"))]
            );
            this.moreButton.style.display = "none";

            this.el.appendChild(this.resultsEl);
            this.el.appendChild(this.moreButton);
        }
    }
}