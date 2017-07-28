define("ui/strings", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Locale;
    (function (Locale) {
        Locale[Locale["EN"] = 0] = "EN";
    })(Locale = exports.Locale || (exports.Locale = {}));
    const text = new Map();
    text.set(Locale.EN, {
        strings: {
            "Party size": "Party size",
            "Party level": "Party level",
            "[party summary]": "Set the size and level of the party. This is used to determine the cost of individual monsters, and set the size of the encounter.",
            "[filter summary]": "Filters are used to determine the set of available monsters to use when generating encounters. The more monsters, the more potential encounters. You do not need to select filters in every category. The number of viable monsters takes into account the filters and the party (above).",
            "[select monsters]": "Determine the subset of all known monsters to generate encounters with. You may either specific exact monstors, or use the filters to determine the set quickly.",
            "[selection mode]": "Choose filtering mode:",
            "[use filters]": "Smart filters",
            "[use pickers]": "Manual monster selection",
            "[pick monsters]": "Select specific monsters by name.",
            "[reset]": "Clear",
            "[results summary]": "Encounters that fit these criteria",
            "generate encounters": "Generate encounters",
            "more": "More…",
            "Number selected ": "Number of viable monsters selected: ",
            "[${0} variations.]": "${0} variations.",
        },
        normalization: {
            prefixes: ["the", "a"]
        }
    });
    function getText(key, locale = Locale.EN) {
        if (text === undefined)
            return key;
        if (!text.has(locale))
            return key;
        const info = text.get(locale);
        if (info.strings[key] === undefined)
            return key;
        return info.strings[key];
    }
    exports.getText = getText;
    function normalizationPrefixes(locale = Locale.EN) {
        if (text === undefined)
            return [];
        if (!text.has(locale))
            return [];
        const info = text.get(locale);
        return info.normalization.prefixes || [];
    }
    exports.normalizationPrefixes = normalizationPrefixes;
    function computeKey(strings, bits) {
        const ret = [];
        for (let i = 0, j = strings.length; i < j; i++) {
            ret.push(strings[i]);
            if (i < bits) {
                ret.push(`\${${i}}`);
            }
        }
        return ret.join("");
    }
    function template(locale = Locale.EN) {
        return (keyParts, ...bits) => {
            const pattern = getText(computeKey(keyParts, bits.length));
            return pattern.replace(/\$\{(\d+)\}/g, (s, i) => {
                return bits[+i];
            });
        };
    }
    exports.template = template;
    function _(v, ...r) {
        if (typeof (v) === "string") {
            return getText(v);
        }
        return template()(v, ...r);
    }
    exports._ = _;
});
define("appcache", ["require", "exports", "ui/strings"], function (require, exports, strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // this module wraps up the application cache with a basic behaviour to allow users 
    // to reload.
    // much of the code is lifted from 
    // http://www.html5rocks.com/en/tutorials/appcache/beginner/
    function probablyOnline() {
        if (!("onLine" in navigator))
            return true;
        return navigator.onLine;
    }
    function inPageConfirm(text, actionText) {
        const confirm = document.createElement("div");
        confirm.className = "C global-confirm";
        confirm.appendChild(document.createTextNode(text));
        const action = document.createElement("span");
        action.className = "action";
        action.appendChild(document.createTextNode(actionText));
        confirm.appendChild(action);
        const close = document.createElement("span");
        close.className = "close";
        close.appendChild(document.createTextNode("╳"));
        confirm.appendChild(close);
        document.body.appendChild(confirm);
        function remove() {
            if (confirm.parentNode)
                confirm.parentNode.removeChild(confirm);
        }
        return new Promise((resolve, reject) => {
            confirm.querySelector(".action").addEventListener("click", (e) => {
                remove();
                resolve(true);
            });
            confirm.querySelector(".close").addEventListener("click", remove);
        });
    }
    function updateReady(e) {
        if (applicationCache.status !== applicationCache.UPDATEREADY)
            return;
        applicationCache.swapCache();
        inPageConfirm(strings_1._ `There is a new version of this app available.`, strings_1._ `Reload?`)
            .then(({}) => location.reload());
    }
    let checkForUpdates;
    let lastCheckTime;
    const CHECK_SPAN = 60 * 60 * 1000; // check hourly
    function performCheck() {
        lastCheckTime = Date.now();
        try {
            applicationCache.update();
        }
        catch (e) { }
    }
    function startCheckCycle() {
        if (checkForUpdates) {
            clearInterval(checkForUpdates);
        }
        checkForUpdates = setInterval(performCheck, CHECK_SPAN);
    }
    function handleOnline() {
        const span = Date.now() - lastCheckTime;
        if (span > CHECK_SPAN) {
            performCheck();
            startCheckCycle();
        }
        else {
            clearTimeout(checkForUpdates);
            setTimeout(() => {
                performCheck();
                startCheckCycle();
            }, CHECK_SPAN - span);
        }
    }
    function handleOffline() {
        if (checkForUpdates) {
            clearInterval(checkForUpdates);
        }
    }
    function handleReloads() {
        applicationCache.addEventListener("updateready", updateReady);
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        performCheck();
        startCheckCycle();
        updateReady();
    }
    exports.handleReloads = handleReloads;
});
define("data-access-worker", ["require", "exports", "common/index"], function (require, exports, index_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function dataAccessWorker() {
        return index_1.typedWorkers.newWorker("static/js/data-access.js");
    }
    exports.dataAccessWorker = dataAccessWorker;
});
define("ui/attribute-filter", ["require", "exports", "ui/strings", "react"], function (require, exports, strings_2, React) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CheckboxList extends React.Component {
        constructor(props) {
            super(props);
        }
        render() {
            // TODO: toggle click on 
            return React.createElement("ul", null, this.props.attributes.map((key) => {
                const k = key.toString();
                const count = this.props.data.counts[key] || 0;
                const classname = count > 0 ? "viable" : "";
                const selected = this.props.data.selected[key] || false;
                return React.createElement("li", { className: classname, onClick: e => this.handleClick(e, key) },
                    React.createElement("input", { type: "checkbox", name: k, checked: selected, onClick: (e) => this.handleClick(e, key) }),
                    React.createElement("label", { htmlFor: k }, key),
                    React.createElement("span", { className: "count" }, count));
            }));
        }
        handleClick(e, key) {
            e.preventDefault();
            if (!this.props.onToggle)
                return;
            this.props.onToggle(key);
        }
    }
    class AttributeFilter extends React.Component {
        constructor(props) {
            super(props);
        }
        calculateStateFromProps(props) {
            const selected = {};
            (this.props.selected || []).forEach(attr => selected[attr] = true);
            return { counts: this.props.counts || {}, selected: selected };
        }
        render() {
            const state = this.calculateStateFromProps(this.props);
            const classname = `C attribute-filter -${this.props.name.toLowerCase().replace(" ", "-")} ${this.anySelected(state.selected) ? "active" : ""}`;
            return React.createElement("div", { className: classname },
                React.createElement("header", null,
                    React.createElement("h2", null,
                        this.props.name,
                        " ",
                        React.createElement("a", { className: "reset", onClick: () => this.clearAll() }, strings_2._ `[reset]`))),
                React.createElement(CheckboxList, { attributes: this.props.attributes, data: state, onToggle: (key) => this.toggleAttribute(key) }));
        }
        calculateSelected(selectedMapping) {
            const attrs = [];
            for (var k in selectedMapping)
                if (selectedMapping.hasOwnProperty(k)) {
                    if (selectedMapping[k])
                        attrs.push(k);
                }
            return attrs;
        }
        clearAll() {
            this.triggerChanged([]);
        }
        anySelected(selected) {
            for (var k in selected)
                if (selected.hasOwnProperty(k)) {
                    if (selected[k])
                        return true;
                }
            return false;
        }
        toggleAttribute(key) {
            const oldSelected = this.calculateStateFromProps(this.props).selected;
            const selected = {};
            for (var k in oldSelected)
                if (oldSelected.hasOwnProperty(k)) {
                    selected[k] = oldSelected[k];
                }
            selected[key] = selected.hasOwnProperty(key) ? !selected[key] : true;
            this.triggerChanged(this.calculateSelected(selected));
        }
        triggerChanged(attrs) {
            if (this.props.onChanged)
                this.props.onChanged(attrs);
        }
    }
    exports.AttributeFilter = AttributeFilter;
});
define("ui/text", ["require", "exports", "ui/strings"], function (require, exports, strings) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ElidableText {
        constructor(prefixes) {
            this.prefixes = prefixes.map(p => p.toLocaleLowerCase());
        }
        [Symbol.replace](string, replaceValue) {
            for (const prefix of this.prefixes) {
                if (string.startsWith(prefix) && string[prefix.length] === " ") {
                    return string.slice(prefix.length);
                }
            }
            return string;
        }
    }
    exports.ElidableText = ElidableText;
    function normalizeText(text) {
        if (text === undefined)
            return "";
        if (text === null)
            return "";
        const elidable = new ElidableText(strings.normalizationPrefixes());
        return text
            .trim()
            .toLocaleLowerCase()
            .replace(elidable, "")
            .trim();
    }
    exports.normalizeText = normalizeText;
    function compareText(a, b) {
        const an = normalizeText(a);
        const bn = normalizeText(b);
        if (an < bn)
            return -1;
        if (an > bn)
            return 1;
        return 0;
    }
    exports.compareText = compareText;
});
define("ui/smart-filters", ["require", "exports", "react", "ui/attribute-filter", "ui/strings", "ui/text"], function (require, exports, React, attribute_filter_1, strings_3, text) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SmartFilter extends React.Component {
        constructor(props) {
            super(props);
        }
        render() {
            const catalog = this.props.catalog;
            const filterSelections = this.props.filterSelections;
            const counts = this.props.counts;
            return (React.createElement("div", { className: "filters" },
                React.createElement("header", null,
                    React.createElement("p", null, strings_3._ `[filter summary]`)),
                React.createElement("div", null,
                    React.createElement(attribute_filter_1.AttributeFilter, { name: "Sources", attributes: catalog.allSources(), selected: filterSelections.sources, counts: counts.sources, onChanged: (attrs) => this.filterChanged("sources", attrs) }),
                    React.createElement(attribute_filter_1.AttributeFilter, { name: "Size", attributes: catalog.allSizes(), selected: filterSelections.size, counts: counts.sizes, onChanged: (attrs) => this.filterChanged("size", attrs) }),
                    React.createElement(attribute_filter_1.AttributeFilter, { name: "Role", attributes: catalog.allKinds(), selected: filterSelections.kind, counts: counts.kinds, onChanged: (attrs) => this.filterChanged("kind", attrs) }),
                    React.createElement(attribute_filter_1.AttributeFilter, { name: "Tags", attributes: catalog.allAttributes().sort(text.compareText), selected: filterSelections.attributes, counts: counts.attributes, onChanged: (attrs) => this.filterChanged("attributes", attrs) })),
                React.createElement("div", { className: "selection-count" },
                    strings_3._ `Number selected` + ' ',
                    " ",
                    this.props.totalSelectedCount)));
        }
        filterChanged(filterName, selectedAttrs) {
            const sels = {};
            const old = this.props.filterSelections;
            for (var k in old)
                if (old.hasOwnProperty(k)) {
                    sels[k] = old[k];
                }
            sels[filterName] = selectedAttrs;
            if (this.props.onChanged)
                this.props.onChanged([filterName, sels]);
        }
    }
    exports.SmartFilter = SmartFilter;
});
define("ui/manual-selection", ["require", "exports", "react", "ui/strings", "ui/text", "ui/attribute-filter"], function (require, exports, React, strings_4, text, attribute_filter_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ManualSelection extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                catalog: props.catalog,
            };
        }
        render() {
            const catalog = this.state.catalog;
            const filterSelections = this.props.filterSelections;
            const counts = this.props.counts;
            return (React.createElement("div", { className: "filters" },
                React.createElement("header", null,
                    React.createElement("p", null, strings_4._ `[pick monsters]`)),
                React.createElement("div", null,
                    React.createElement(attribute_filter_2.AttributeFilter, { name: "By Name", attributes: catalog.allNames().sort(text.compareText), selected: filterSelections.name, counts: counts.names, onChanged: (attrs) => this.filterChanged("name", attrs) }))));
        }
        filterChanged(filterName, selectedAttrs) {
            const sels = {};
            const old = this.props.filterSelections;
            for (var k in old)
                if (old.hasOwnProperty(k)) {
                    sels[k] = old[k];
                }
            sels[filterName] = selectedAttrs;
            if (this.props.onChanged)
                this.props.onChanged([filterName, sels]);
        }
    }
    exports.ManualSelection = ManualSelection;
});
define("ui/selection", ["require", "exports", "react", "ui/strings", "common/event", "ui/smart-filters", "ui/manual-selection"], function (require, exports, React, strings_5, event_1, smart_filters_1, manual_selection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class FilterStore {
        constructor() {
            this.onChanged = new event_1.Event();
            this.filters = {};
        }
        getFilters() {
            return this.filters;
        }
        updateFilters(filters) {
            this.filters = filters;
            this.onChanged.trigger(undefined);
        }
    }
    exports.FilterStore = FilterStore;
    var SelectionMode;
    (function (SelectionMode) {
        SelectionMode[SelectionMode["Smart"] = 0] = "Smart";
        SelectionMode[SelectionMode["Manual"] = 1] = "Manual";
    })(SelectionMode || (SelectionMode = {}));
    class Selection extends React.Component {
        constructor(props) {
            super(props);
            this.props.store.onChanged.register(({}) => {
                this.setState({ filters: this.props.store.getFilters() });
            });
            this.state = {
                mode: SelectionMode.Smart,
                filters: this.props.store.getFilters(),
            };
        }
        render() {
            const mode = this.state.mode;
            return (React.createElement("section", { className: "selection" },
                React.createElement("header", null,
                    React.createElement("h1", null, strings_5._ `Filter monsters`),
                    React.createElement("p", null, strings_5._ `[select monsters]`)),
                React.createElement("div", null,
                    React.createElement("p", null,
                        strings_5._ `[selection mode]` + " ",
                        React.createElement("a", { className: `mode-switch -filters ${mode === SelectionMode.Smart ? "-active" : ""}`, onClick: () => this.switchMode(SelectionMode.Smart) }, strings_5._ `[use filters]`),
                        " ",
                        React.createElement("a", { className: `mode-switch -filters ${mode === SelectionMode.Manual ? "-active" : ""}`, onClick: () => this.switchMode(SelectionMode.Manual) }, strings_5._ `[use pickers]`))),
                this.state.mode === SelectionMode.Smart
                    ? React.createElement(smart_filters_1.SmartFilter, { catalog: this.props.catalog, filterSelections: this.state.filters, counts: this.props.counts, onChanged: ([name, filters]) => this.filtersChanged(name, filters), totalSelectedCount: this.props.totalSelectedCount })
                    : React.createElement(manual_selection_1.ManualSelection, { catalog: this.props.catalog, filterSelections: this.state.filters, counts: this.props.counts, onChanged: ([name, filters]) => this.filtersChanged(name, filters) })));
        }
        filtersChanged(name, filters) {
            this.props.store.updateFilters(filters); // the store will trigger an update event that will be propagated to setState
        }
        switchMode(mode) {
            this.setState({ mode: mode });
        }
    }
    exports.Selection = Selection;
});
define("ui/party-ui", ["require", "exports", "react", "ui/strings", "common/messaging"], function (require, exports, React, strings_6, messaging_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class NumericInput extends React.Component {
        constructor(props) {
            super(props);
        }
        render() {
            const dataId = `${this.props.label}_options`;
            return (React.createElement("div", { className: "field" },
                React.createElement("label", null, this.props.label),
                React.createElement("input", { type: "range", step: "1", min: "1", max: this.props.max, value: this.props.value.toString(), onChange: (e) => this.onChangeHandler(e), list: dataId }),
                React.createElement("datalist", { id: dataId }, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => React.createElement("option", { value: v.toString() }))),
                React.createElement("span", null, this.props.value)));
        }
        onChangeHandler(e) {
            const computedValue = +e.target.value;
            if (this.props.onChanged) {
                this.props.onChanged(computedValue);
            }
        }
    }
    class Party extends React.Component {
        constructor(props) {
            super(props);
        }
        render() {
            return (React.createElement("section", { className: "party" },
                React.createElement("header", null,
                    React.createElement("h1", null, strings_6._("Party")),
                    React.createElement("p", null, strings_6._("[party summary]"))),
                React.createElement(NumericInput, { label: strings_6._("Party size"), value: this.props.party.size, max: 10, onChanged: (v) => this.sizeChanged(v) }),
                React.createElement(NumericInput, { label: strings_6._("Party level"), value: this.props.party.level, max: 10, onChanged: (v) => this.levelChanged(v) })));
        }
        sizeChanged(newSize) {
            const partyInfo = { size: newSize, level: this.props.party.level };
            this.props.worker.postMessage(messaging_1.dataAccess.partyPutMessage(partyInfo));
        }
        levelChanged(newLevel) {
            const partyInfo = { size: this.props.party.size, level: newLevel };
            this.props.worker.postMessage(messaging_1.dataAccess.partyPutMessage(partyInfo));
        }
    }
    exports.Party = Party;
});
define("ui/paginator", ["require", "exports", "react"], function (require, exports, React) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function Pager(props) {
        const prev = React.createElement("a", { href: "#", onClick: ev => { props.onPageClick(props.currentPage - 1); ev.preventDefault(); } }, "\u25C0\uFE0E");
        const next = React.createElement("a", { href: "#", onClick: ev => { props.onPageClick(props.currentPage + 1); ev.preventDefault(); } }, "\u25C0");
        return (React.createElement("ol", null,
            React.createElement("li", { className: "prev" }, props.currentPage <= 1 ? React.createElement("span", null, "\u25C0\uFE0E") : prev),
            props.pages.map(p => (React.createElement("li", { className: p === props.currentPage ? "current" : "" },
                React.createElement("a", { href: "#", onClick: ev => { props.onPageClick(p); ev.preventDefault(); } }, p + 1)))),
            React.createElement("li", { className: "next" }, props.currentPage === props.pages[props.pages.length - 1] ? React.createElement("span", null, "\u25C0\uFE0E") : next)));
    }
    class Paginator extends React.Component {
        constructor(props) {
            super(props);
            this.state = { page: 0 };
        }
        componentWillReceiveProps(props) {
            this.setState({ page: 0 });
        }
        render() {
            const start = this.props.pageSize * this.state.page;
            const end = start + this.props.pageSize;
            const dataWindow = this.props.data.slice(start, end);
            if (this.props.pageSize > this.props.data.length) {
                return (React.createElement("div", { className: "C paginator" },
                    React.createElement("ul", null, dataWindow.map(this.props.render))));
            }
            return (React.createElement("div", { className: "C paginator" },
                React.createElement("header", null,
                    React.createElement(Pager, { currentPage: this.state.page, pages: this.pageList(), onPageClick: n => this.changePage(n) })),
                React.createElement("ul", null, dataWindow.map(this.props.render)),
                React.createElement("footer", null,
                    React.createElement(Pager, { currentPage: this.state.page, pages: this.pageList(), onPageClick: n => this.changePage(n) }))));
        }
        pageList() {
            const pages = [];
            const halfWindow = 5;
            const lower = Math.max(this.state.page - halfWindow, 0);
            const max = Math.ceil(this.props.data.length / this.props.pageSize);
            const upper = Math.min(lower + (2 * halfWindow), max);
            for (var i = lower; i < upper; i++) {
                pages[i] = i;
            }
            return pages;
        }
        changePage(n) {
            this.setState({ page: n });
        }
    }
    exports.Paginator = Paginator;
});
define("ui/results", ["require", "exports", "react", "ui/strings", "ui/paginator"], function (require, exports, React, strings_7, paginator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function Allocation(props) {
        const alloc = props.alloc;
        const className = `C allocation ${alloc.monster.size}`;
        return (React.createElement("div", { className: className },
            React.createElement("div", { className: "kind" },
                strings_7._(alloc.monster.kind),
                React.createElement("span", { className: "level" }, alloc.monster.level),
                React.createElement("span", { className: "book" },
                    alloc.monster.book,
                    " ",
                    strings_7._("pg."),
                    " ",
                    alloc.monster.pageNumber)),
            React.createElement("em", null, strings_7._(alloc.monster.name)),
            React.createElement("span", { className: "number" }, alloc.num)));
    }
    function AbbreviatedAllocation(props) {
        const alloc = props.alloc;
        const className = `C allocation -abbreviated`;
        return (React.createElement("div", { className: className },
            React.createElement("em", null, strings_7._(alloc.monster.name)),
            React.createElement("span", { className: "number" }, alloc.num)));
    }
    class AllocationGroup extends React.Component {
        constructor(props) {
            super(props);
            this.state = { open: false };
        }
        render() {
            const encounters = this.props.encounters;
            if (encounters.length === 1) {
                return React.createElement("li", { className: "C encounter -single" }, encounters[0].map((alloc) => React.createElement(Allocation, { alloc: alloc })));
            }
            return (React.createElement("li", { className: `C encounter -multiple ${this.state.open ? "-open" : ""}` },
                React.createElement("div", { className: "stereotype" }, encounters[0].map((alloc) => React.createElement(Allocation, { alloc: alloc }))),
                React.createElement("em", null,
                    React.createElement("a", { href: "#", onClick: e => { this.setState({ open: !this.state.open }); e.preventDefault(); } }, strings_7._ `[${encounters.length - 1} variations.]`)),
                React.createElement("ul", { className: "variants" }, encounters.slice(1).map((enc) => React.createElement("li", null, enc.map((alloc) => React.createElement(AbbreviatedAllocation, { alloc: alloc })))))));
        }
    }
    class Results extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                stale: true,
                allocs: [],
                show: 100,
            };
        }
        render() {
            const allocs = (this.props.generatedEncounters || []);
            const party = this.props.party || { level: 0, size: 0 };
            return (React.createElement("section", { className: "C results" },
                React.createElement("header", null,
                    React.createElement("h1", null, strings_7._ `Encounters`),
                    React.createElement("p", null, strings_7._ `[results summary]`)),
                React.createElement("div", { className: "button generate", onClick: (_) => this.generateClicked() }, strings_7._ `generate encounters`),
                React.createElement("section", { className: "C encounters" },
                    React.createElement("header", null,
                        React.createElement("h1", null, strings_7._ `Possible encounters`),
                        React.createElement("p", null, strings_7._ `${this.props.generatedEncounters
                            ? this.props.generatedEncounters.length
                            : 0} encounters for ${party.size} level ${party.level} characters.`)),
                    React.createElement(paginator_1.Paginator, { pageSize: this.state.show, data: allocs, render: encounter => React.createElement(AllocationGroup, { encounters: encounter }) }))));
        }
        generateClicked() {
            if (this.props.onRequestGenerate)
                this.props.onRequestGenerate();
        }
    }
    exports.Results = Results;
});
define("ui/application", ["require", "exports", "react", "react-dom", "common/", "ui/strings", "ui/selection", "ui/party-ui", "ui/results"], function (require, exports, React, ReactDOM, _1, strings_8, selection_1, party_ui_1, results_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Application extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                partyInfoCache: { size: 1, level: 1 },
                catalog: _1.bestiary.createBestiary({}),
                filterStore: new selection_1.FilterStore()
            };
            // kludge
            this.state.filterStore.onChanged.register(({}) => this.forceUpdate());
            // temporary kludge
            this.props.dataAccess.addEventListener("message", (message) => {
                if (_1.messaging.dataAccess.isPartyMessage(message.data) && _1.messaging.dataAccess.isPartyData(message.data)) {
                    this.setState({ partyInfoCache: message.data.party });
                }
            });
            this.props.dataAccess.postMessage(_1.messaging.dataAccess.partyGetMessage());
            this.requestBestiary();
        }
        requestBestiary() {
            const chan = new MessageChannel();
            chan.port2.onmessage = (message) => this.updateBestiary(message.data);
            this.props.dataAccess.postMessage(_1.messaging.dataAccess.bestiaryGetMessage(), [chan.port1]);
        }
        updateBestiary(message) {
            if (_1.messaging.dataAccess.isBestiaryData(message)) {
                this.setState({ catalog: _1.bestiary.createBestiary(message.dataset) });
            }
            else {
                console.warn("Unexpected message", message);
            }
        }
        featureCounts() {
            return this.state.catalog.featureCounts(this.state.partyInfoCache, this.state.filterStore.getFilters());
        }
        getSelection() {
            const pred = _1.data.predicateForFilters(this.state.filterStore.getFilters());
            return this.state.catalog.filteredBestiary(this.state.partyInfoCache, pred);
        }
        render() {
            if (!this.state) {
                return React.createElement("div", { className: "loading" }, strings_8._ `Loading...`);
            }
            return (React.createElement("div", null,
                React.createElement(party_ui_1.Party, { worker: this.props.dataAccess, party: this.state.partyInfoCache }),
                React.createElement(selection_1.Selection, { store: this.state.filterStore, catalog: this.state.catalog, counts: this.featureCounts(), totalSelectedCount: this.getSelection().length }),
                React.createElement(results_1.Results, { generatedEncounters: this.state.generatedEncounters, onRequestGenerate: () => this.generate(), party: this.state.partyInfoCache })));
        }
        generate() {
            const selection = this.getSelection();
            this.props.allocator(this.state.partyInfoCache, selection)
                .then((alloc) => this.setState({ generatedEncounters: alloc }));
        }
    }
    exports.Application = Application;
    function installApplication(el, allocator, dataAccess) {
        return ReactDOM.render(React.createElement(Application, { allocator: allocator, dataAccess: dataAccess }), el);
    }
    exports.installApplication = installApplication;
});
define("ui", ["require", "exports", "ui/strings", "ui/application", "common/messaging", "common/localstorage"], function (require, exports, strings_9, application_1, messaging_2, localstorage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // UI represents the whole UI, and is constructed of a series
    // of sub views.
    // UI also acts as the primary view controller for the application    
    class UI {
        constructor(root, allocator, dataAccessWorker) {
            this.root = root;
            this.allocator = allocator;
            this.dataAccessWorker = dataAccessWorker;
            // punch in react replacement
            const reactContainer = document.createElement("div");
            application_1.installApplication(reactContainer, allocator, dataAccessWorker);
            root.appendChild(reactContainer);
            // end of react replacement
        }
    }
    // testing utility
    function awaitDelay(t) {
        return (v) => new Promise((resolve, {}) => setTimeout(() => resolve(v), t));
    }
    // show a loading bezel while the json data is loading.
    function loadingUI(root, promise) {
        const loading = document.createElement("div");
        loading.appendChild(document.createTextNode(strings_9._("Loading...")));
        root.appendChild(loading);
        promise.then(({}) => {
            root.removeChild(loading);
        });
    }
    // initialize is the public interface tothe UI; it will 
    // instantiate everythign and do the basic procedures requred
    // to get a UI going for the given data.
    function initialize(root, dataAccessWorker, ready, allocator) {
        //bestiary = bestiary.then(awaitDelay(2000));
        dataAccessWorker.postMessage(messaging_2.dataAccess.linkLocalStorageMessage(), [localstorage_1.localStoragePort()]);
        ready
            .then(({}) => {
            new UI(root, allocator, dataAccessWorker);
        })
            .catch((e) => {
            console.log(e);
        });
        loadingUI(root, ready);
    }
    exports.initialize = initialize;
});
define("manticore", ["require", "exports", "ui/strings", "common/typed-workers", "appcache", "ui", "data-access-worker"], function (require, exports, strings_10, workers, appcache, ui, model) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function awaitContentLoaded() {
        return new Promise((resolve, reject) => {
            document.addEventListener("DOMContentLoaded", ({}) => {
                appcache.handleReloads();
                resolve({});
            });
        });
    }
    // Some browsers dont support generators. This test is a little gross but it 
    // does allow us to switch implementations.
    const GENERATORS_AVAILABLE = (() => {
        try {
            eval("(function*(){})");
            return true;
        }
        catch (e) {
            return false;
        }
    })();
    // There are two implementations of the processing worker script.
    // The main one use ES6 generators directly, while the fallback
    // uses Typescript's downlevel iteration compiler to produce an 
    // ES3/5 compatible script. The downside is that this is runs 
    // a little slower.
    function workerResource() {
        return `static/js/processing${GENERATORS_AVAILABLE ? "" : "-fallback"}.js`;
    }
    function allocate(party, monsters) {
        const allocationWorker = workers.newWorker(workerResource());
        return new Promise(resolve => {
            allocationWorker.onmessage = (message) => {
                resolve(message.data);
            };
            allocationWorker.postMessage([party, monsters]);
        });
    }
    ui.initialize(document.getElementById("application"), model.dataAccessWorker(), awaitContentLoaded()
        .then(_ => undefined)
        .catch(e => console.error(strings_10._ `An error occured bootstrapping the application`, e)), allocate);
});
