var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var manticore;
(function (manticore) {
    var data;
    (function (data) {
        var Monster = (function () {
            function Monster(name, level, size, kind, attributes, book) {
                this.name = name;
                this.level = level;
                this.size = size;
                this.kind = kind;
                this.attributes = attributes;
                this.book = book;
                if (kind === "mook") {
                    this.scale = "mook";
                }
                else {
                    this.scale = size;
                }
            }
            Monster.prototype.toString = function () {
                return this.name + "(level " + this.level + " " + this.kind + ")";
            };
            return Monster;
        }());
        data.Monster = Monster;
        function anyPredicate(preds) {
            return function (v) {
                for (var i = 0, j = preds.length; i < j; i++) {
                    if (preds[i](v))
                        return true;
                }
                return false;
            };
        }
        function allPredicate(preds) {
            return function (v) {
                for (var i = 0, j = preds.length; i < j; i++) {
                    if (!preds[i](v))
                        return false;
                }
                return true;
            };
        }
        function sizePredicate(size) {
            return function (m) { return m.size === size; };
        }
        function kindPredicate(kind) {
            return function (m) { return m.kind === kind; };
        }
        function sourcePredicate(source) {
            return function (m) { return m.book === source; };
        }
        function namePredicate(name) {
            return function (m) { return m.name === name; };
        }
        function hasOneAttributePredicate(attributes) {
            return function (m) {
                var mattrs = m.attributes;
                for (var i = 0, j = attributes.length; i < j; i++) {
                    if (mattrs.indexOf(attributes[i]) >= 0)
                        return true;
                }
                return false;
            };
        }
        function predicateForFilters(filters) {
            var predicates = [];
            for (var key in filters)
                if (filters.hasOwnProperty(key)) {
                    var attributes = filters[key];
                    if (attributes === null || attributes.length == 0)
                        continue;
                    if (key === "name") {
                        predicates.push(anyPredicate(attributes.map(namePredicate)));
                    }
                    else if (key === "size") {
                        predicates.push(anyPredicate(attributes.map(sizePredicate)));
                    }
                    else if (key === "kind") {
                        predicates.push(anyPredicate(attributes.map(kindPredicate)));
                    }
                    else if (key === "sources") {
                        predicates.push(anyPredicate(attributes.map(sourcePredicate)));
                    }
                    else if (key === "attributes") {
                        predicates.push(hasOneAttributePredicate(attributes));
                    }
                    else {
                        throw new Error("unknown filter type: " + key);
                    }
                }
            return allPredicate(predicates);
        }
        data.predicateForFilters = predicateForFilters;
    })(data = manticore.data || (manticore.data = {}));
})(manticore || (manticore = {}));
var manticore;
(function (manticore) {
    var bestiary;
    (function (bestiary) {
        var PricedMonster = (function (_super) {
            __extends(PricedMonster, _super);
            function PricedMonster(name, level, size, kind, attributes, book, price) {
                _super.call(this, name, level, size, kind, attributes, book);
                this.price = price;
            }
            return PricedMonster;
        }(manticore.data.Monster));
        var MonsterAllocation = (function () {
            function MonsterAllocation(monster, num) {
                this.num = num;
                this.cost = monster.price * num;
                this.monster = monster;
            }
            MonsterAllocation.prototype.toString = function () {
                return this.monster.toString() + " x" + this.num;
            };
            return MonsterAllocation;
        }());
        function scaleFactor(scale, partyLevel) {
            var base = (3 * 4 * 5);
            if (scale === "mook") {
                if (partyLevel === 1) {
                    return base / 3;
                }
                else if (partyLevel === 2) {
                    return base / 4;
                }
                else {
                    return base / 5;
                }
            }
            else if (scale === "normal") {
                return base;
            }
            else if (scale === "large") {
                return base * 2;
            }
            else if (scale === "huge") {
                return base * 3;
            }
            throw new Error("invalid scale '" + scale + "'");
        }
        function tierAdjustment(tier) {
            return ({
                adventurer: 0,
                champion: 1,
                epic: 2
            })[tier];
        }
        function levelToTier(level) {
            return [
                null,
                "adventurer",
                "adventurer",
                "adventurer",
                "adventurer",
                "champion",
                "champion",
                "champion",
                "epic",
                "epic",
                "epic"
            ][level];
        }
        function relativeCost(relativeLevel) {
            switch (relativeLevel) {
                case -2: return 2;
                case -1: return 3;
                case 0: return 4;
                case 1: return 6;
                case 2: return 8;
                case 3: return 12;
                case 4: return 16;
                default: return null;
            }
        }
        function adjustment(level) {
            return tierAdjustment(levelToTier(level));
        }
        function relativeLevel(partyLevel, monsterLevel) {
            var monsterAdjusted = monsterLevel - adjustment(partyLevel);
            return monsterAdjusted - partyLevel;
        }
        function monsterFromRecord(book) {
            return function (record) { return new manticore.data.Monster(record[0], record[1], record[2], record[3], record[4], book); };
        }
        function isViable(party, monster) {
            var levelDiff = relativeLevel(party.level, monster.level);
            if (levelDiff === 4 && monster.scale === "huge")
                return false;
            var cost = relativeCost(levelDiff);
            if (cost === null)
                return false;
            if (cost * scaleFactor(monster.scale, party.level) > priceParty(party.size))
                return false;
            return true;
        }
        function priceMonster(partyLevel, m) {
            var cost = relativeCost(relativeLevel(partyLevel, m.level));
            var multiplier = scaleFactor(m.scale, partyLevel);
            if (cost === null)
                return null;
            return new PricedMonster(m.name, m.level, m.size, m.kind, m.attributes, m.book, cost * multiplier);
        }
        function priceParty(characters) {
            return characters * scaleFactor("normal", 1) * relativeCost(0);
        }
        function repeatMonster(points, monster) {
            var max = Math.floor(points / monster.price);
            var repeats = [];
            for (var i = 1; i <= max; i++) {
                repeats[repeats.length] = new MonsterAllocation(monster, i);
            }
            return repeats;
        }
        function allocateMonsters(points, monsters) {
            var allAllocations = [];
            var allowedUnspent = Math.min.apply(null, monsters.map(function (m) { return m.price; }));
            var startT = +new Date();
            function allocate(remainingPoints, monstersIdx, acc) {
                if (+new Date() - startT >= 2000)
                    throw { message: "Ran too long; Results truncated" };
                if (remainingPoints < allowedUnspent) {
                    if (acc.length > 0)
                        allAllocations[allAllocations.length] = acc;
                    return;
                }
                if (monstersIdx >= monsters.length)
                    return;
                var repeats = repeatMonster(remainingPoints, monsters[monstersIdx]);
                var cur = acc;
                allocate(remainingPoints, monstersIdx + 1, cur);
                for (var i = 0, j = repeats.length; i < j; i++) {
                    cur = acc.slice();
                    var alloc = repeats[i];
                    cur[cur.length] = alloc;
                    allocate(remainingPoints - alloc.cost, monstersIdx + 1, cur);
                }
            }
            try {
                allocate(points, 0, []);
            }
            catch (ex) {
            }
            return allAllocations;
        }
        function allocationsForParty(party, selectedMonsters) {
            return allocateMonsters(priceParty(party.size), selectedMonsters
                .map(function (m) { return priceMonster(party.level, m); })
                .filter(function (m) { return m !== null; }));
        }
        bestiary.allocationsForParty = allocationsForParty;
        var Bestiary = (function () {
            function Bestiary(monsters) {
                this.monsters = monsters;
            }
            Bestiary.prototype.allSources = function () {
                return this.distinctValues(function (m) { return m.book; });
            };
            Bestiary.prototype.allNames = function () {
                return this.distinctValues(function (m) { return m.name; });
            };
            Bestiary.prototype.allSizes = function () {
                return this.distinctValues(function (m) { return m.size; });
            };
            Bestiary.prototype.allKinds = function () {
                return this.distinctValues(function (m) { return m.kind; });
            };
            Bestiary.prototype.allAttributes = function () {
                var attributes = [];
                this.monsters.forEach(function (m) {
                    m.attributes.forEach(function (a) {
                        if (attributes.indexOf(a) === -1)
                            attributes.push(a);
                    });
                });
                return attributes;
            };
            Bestiary.prototype.featureCounts = function (party, filters) {
                var _this = this;
                var descriptors = [
                    { countKey: "sources", monsterKey: "book", filterKey: "sources" },
                    { countKey: "sizes", monsterKey: "size", filterKey: "size" },
                    { countKey: "kinds", monsterKey: "kind", filterKey: "kind" },
                    { countKey: "names", monsterKey: "name", filterKey: "name" },
                    { countKey: "attributes", monsterKey: "attributes", filterKey: "attributes" },
                ];
                function filtersExcluding(key) {
                    var fs = {};
                    Object.keys(filters).filter(function (k) { return k != key; }).forEach(function (k) { return fs[k] = filters[k]; });
                    return fs;
                }
                function applicableFilters(descriptor) {
                    return {
                        countKey: descriptor.countKey,
                        monsterKey: descriptor.monsterKey,
                        predicate: manticore.data.predicateForFilters(filtersExcluding(descriptor.filterKey))
                    };
                }
                var viableForFilters = function (descriptor) {
                    var viable = _this.filteredBestiary(party, descriptor.predicate);
                    var countMap = {};
                    function inc(key) {
                        var v = countMap.hasOwnProperty(key) ? countMap[key] : 0;
                        countMap[key] = v + 1;
                    }
                    for (var i = 0, j = viable.length; i < j; i++) {
                        var m = viable[i];
                        var attr = m[descriptor.monsterKey];
                        if (attr instanceof Array) {
                            attr.forEach(inc);
                        }
                        else {
                            inc(attr);
                        }
                    }
                    return countMap;
                };
                var counts = {
                    sources: {},
                    sizes: {},
                    kinds: {},
                    attributes: {},
                    names: {}
                };
                descriptors.map(applicableFilters).forEach(function (d) {
                    counts[d.countKey] = viableForFilters(d);
                });
                return counts;
            };
            Bestiary.prototype.filteredBestiary = function (party, filter) {
                return this.monsters
                    .filter(function (m) { return isViable(party, m); })
                    .filter(filter);
            };
            Bestiary.prototype.distinctValues = function (accessor) {
                var vals = [];
                this.monsters.forEach(function (m) {
                    var v = accessor(m);
                    if (vals.indexOf(v) === -1)
                        vals.push(v);
                });
                return vals;
            };
            return Bestiary;
        }());
        bestiary.Bestiary = Bestiary;
        function createBestiary(dataset) {
            var catalog = [];
            for (var key in dataset)
                if (dataset.hasOwnProperty(key)) {
                    catalog = catalog.concat(dataset[key].map(monsterFromRecord(key)));
                }
            return new Bestiary(catalog);
        }
        bestiary.createBestiary = createBestiary;
    })(bestiary = manticore.bestiary || (manticore.bestiary = {}));
})(manticore || (manticore = {}));
var manticore;
(function (manticore) {
    var messaging;
    (function (messaging) {
        function message(key, payload) {
            return { key: key, payload: payload };
        }
        var dataAccess;
        (function (dataAccess) {
            var PartyGetKey = "party.get";
            var PartyPutKey = "party.put";
            var PartyDataKey = "party.data";
            function isPartyMessage(msg) {
                return (msg.key === PartyGetKey || msg.key === PartyPutKey);
            }
            dataAccess.isPartyMessage = isPartyMessage;
            function isPartyGet(msg) {
                return (msg.key === PartyGetKey);
            }
            dataAccess.isPartyGet = isPartyGet;
            function isPartyPut(msg) {
                return (msg.key === PartyPutKey);
            }
            dataAccess.isPartyPut = isPartyPut;
            function isPartyData(msg) {
                return (msg.key === PartyDataKey);
            }
            dataAccess.isPartyData = isPartyData;
            function partyPutMessage(data) {
                return { key: PartyPutKey, payload: data };
            }
            dataAccess.partyPutMessage = partyPutMessage;
            function partyGetMessage() {
                return { key: PartyGetKey, payload: undefined };
            }
            dataAccess.partyGetMessage = partyGetMessage;
            function partyDataMessage(data) {
                return { key: PartyDataKey, payload: data };
            }
            dataAccess.partyDataMessage = partyDataMessage;
            var BestiaryGetKey = "bestiary.get";
            function isBestiaryMessage(msg) {
                return (msg.key === "Bestiary.Get");
            }
            dataAccess.isBestiaryMessage = isBestiaryMessage;
            function isBestiaryGet(msg) {
                return (msg.key === "Bestiary.Get");
            }
            dataAccess.isBestiaryGet = isBestiaryGet;
            function bestiaryGetMessage(resourceName) {
                return { key: BestiaryGetKey, payload: { getResource: resourceName } };
            }
            dataAccess.bestiaryGetMessage = bestiaryGetMessage;
        })(dataAccess = messaging.dataAccess || (messaging.dataAccess = {}));
    })(messaging = manticore.messaging || (manticore.messaging = {}));
})(manticore || (manticore = {}));
var manticore;
(function (manticore) {
    var workers;
    (function (workers) {
        var dataAccess;
        (function (dataAccess) {
            onmessage = function (message) {
            };
        })(dataAccess = workers.dataAccess || (workers.dataAccess = {}));
    })(workers = manticore.workers || (manticore.workers = {}));
})(manticore || (manticore = {}));
