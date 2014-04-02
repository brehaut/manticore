(ns manticore.bestiary
  (:require [clojure.browser.repl]))

 ;; The following relations encodes the Monster Equivalents 
 ;; table from 13th Age as a set of relations

(def size-factor 
  "A cost multipler for monster size"
  {:13thage/mook 1
   :13thage/normal 5
   :13thage/large 10
   :13thage/huge 15})


(def tier-adjustment 
  "The adjustment for relative levels based on tier.

   At champion tier, an monster of equivalent level is 
   consider to be one cost grade lower than the party for instance."
  {:13thage/adventurer 0
   :13thage/champion 1
   :13thage/epic 2})


(def level-tier 
  "Maps levels to tiers."
  {1  :13thage/adventurer
   2  :13thage/adventurer
   3  :13thage/adventurer
   4  :13thage/adventurer
   5  :13thage/champion 
   6  :13thage/champion 
   7  :13thage/champion 
   8  :13thage/epic 
   9  :13thage/epic 
   10 :13thage/epic})


(def relative-cost 
  "Produces the base relative cost for a monster with respect
   to it the party level. All costs are relative to adventurer
   tier. Use the tier-adjustment to correct for appropriate tier.
   "
   ;; note:13thage/ these numbers are scaled up by 40 so that   
   ;; so that when multipled by size-factor (above) 
   ;; they are all integers.
  {-2 2
   -1 3
   0 4
   1 6
   2 8
   3 12
   4 16})


;; the following encodes the monsters table from the 13th age core
;; book.
;;
;; These are all processed with vec->monster (below) for actual use.

(def monsters
  "Monsters from 13th Age core book as a small database to
   search for matching encounters"
  [["Giant ant" 0 :13thage/normal :13thage/troop [:13thage/animal]]

   ["Decrepit skeleton" 1 :13thage/normal :13thage/mook [:13thage/undead :13thage/skeleton]]
   ["Dire rat" 1 :13thage/normal :13thage/mook [:13thage/animal :13thage/dire]]
   ["Giant scorpion" 1 :13thage/normal :13thage/wrecker [:13thage/animal]]
   ["Goblin grunt" 1 :13thage/normal :13thage/troop [:13thage/goblin]]
   ["Goblin scum" 1 :13thage/normal :13thage/mook [:13thage/goblin]]
   ["Human thug" 1 :13thage/normal :13thage/troop [:13thage/human]]
   ["Kobold archer" 1 :13thage/normal :13thage/mook [:13thage/kobold]]
   ["Kobold warrior" 1 :13thage/normal :13thage/troop [:13thage/kobold]]
   ["Orc warrior" 1 :13thage/normal :13thage/troop [:13thage/orc]]
   ["Skeletal hound" 1 :13thage/normal :13thage/blocker [:13thage/undead :13thage/skeleton]]
   ["Skeletal archer" 1 :13thage/normal :13thage/archer [:13thage/undead :13thage/skeleton]]
   ["Wolf" 1 :13thage/normal :13thage/troop [:13thage/animal]]
   ["Zombie shuffler" 1 :13thage/normal :13thage/mook [:13thage/undead :13thage/zombie]]

   ["Ankheg" 2 :13thage/large :13thage/troop [:13thage/animal]]
   ["Bear" 2 :13thage/normal :13thage/troop [:13thage/animal]]
   ["Giant web spider" 2 :13thage/large :13thage/blocker [:13thage/animal]]
   ["Goblin shaman" 2 :13thage/normal :13thage/caster [:13thage/goblin]]
   ["Hobgoblin warrior" 2 :13thage/normal :13thage/troop [:13thage/goblin]]
   ["Human zombie" 2 :13thage/normal :13thage/troop [:13thage/undead :13thage/zombie]]
   ["Hunting spider" 2 :13thage/normal :13thage/wrecker [:13thage/animal]]
   ["Kobold hero" 2 :13thage/normal :13thage/leader [:13thage/kobold]]
   ["Lizardman savage" 2 :13thage/normal :13thage/wrecker [:13thage/lizardman]]
   ["Medium white dragon" 2 :13thage/normal :13thage/troop [:13thage/dragon :13thage/white-dragon]]
   ["Newly-risen ghoul" 2 :13thage/normal :13thage/mook [:13thage/undead :13thage/ghoul]]
   ["Orc berserker" 2 :13thage/normal :13thage/troop [:13thage/orc]]
   ["Orc shaman" 2 :13thage/normal :13thage/leader [:13thage/orc]]
   ["Skeletal warrior" 2 :13thage/normal :13thage/troop [:13thage/undead :13thage/skeleton]]
   ["Trog" 2 :13thage/normal :13thage/spoiler [:13thage/troglodyte]]

   ["Bugbear" 3 :13thage/normal :13thage/troop [:13thage/goblin]]
   ["Dire wolf" 3 :13thage/large :13thage/troop [:13thage/animal :13thage/dire]]
   ["Dretch" 3 :13thage/normal :13thage/mook [:13thage/demon]]
   ["Ghoul" 3 :13thage/normal :13thage/spoiler [:13thage/undead :13thage/ghoul]]
   ["Gnoll ranger" 3 :13thage/normal :13thage/archer [:13thage/gnoll]]
   ["Gnoll savage" 3 :13thage/normal :13thage/troop [:13thage/gnoll]]
   ["Hell hound" 3 :13thage/normal :13thage/wrecker [:13thage/beast]]
   ["Hungry star" 3 :13thage/normal :13thage/wrecker [:13thage/abberation]]
   ["Imp" 3 :13thage/normal :13thage/spoiler [:13thage/demon]]
   ["Medium black dragon" 3 :13thage/normal :13thage/wrecker [:13thage/dragon :13thage/black]]
   ["Ochre jelly" 3 :13thage/large :13thage/wrecker [:13thage/ooze]]
   ["Ogre" 3 :13thage/large :13thage/troop [:13thage/giant]]
   ["Otyugh" 3 :13thage/large :13thage/blocker [:13thage/abberation]]
   ["Trog chanter" 3 :13thage/normal :13thage/leader [:13thage/troglodyte]]

   ["Blackamber skeletal legionnaire" 4 :13thage/normal :13thage/troop [:13thage/undead :13thage/skeleton]]
   ["Derro maniac" 4 :13thage/normal :13thage/troop [:13thage/derro :13thage/dwarf]]
   ["Derro sage" 4 :13thage/normal :13thage/caster [:13thage/derro :13thage/dwarf]]
   ["Despoiler" 4 :13thage/normal :13thage/caster [:13thage/demon]]
   ["Dire bear" 4 :13thage/large :13thage/troop [:13thage/beast :13thage/dire]]
   ["Flesh golem" 4 :13thage/large :13thage/blocker [:13thage/construct :13thage/golem]]
   ["Gnoll war leader" 4 :13thage/normal :13thage/leader [:13thage/gnoll]]
   ["Half-orc legionnaire" 4 :13thage/normal :13thage/troop [:13thage/half-orc :13thage/humanoid]]
   ["Harpy" 4 :13thage/normal :13thage/spoiler [:13thage/humanoid]]
   ["Hobgoblin captain" 4 :13thage/normal :13thage/leader [:13thage/goblin]]
   ["Large white dragon" 4 :13thage/large :13thage/troop [:13thage/dragon :13thage/white]]
   ["Medium green dragon" 4 :13thage/normal :13thage/spoiler [:13thage/dragon :13thage/green]]
   ["Minotaur" 4 :13thage/large :13thage/troop [:13thage/humanoid]]
   ["Owl bear" 4 :13thage/large :13thage/wrecker [:13thage/beast]]
   ["Troll" 4 :13thage/large :13thage/troop [:13thage/giant]]
   ["Wight" 4 :13thage/normal :13thage/spoiler [:13thage/undead]]

   ["Bulette" 5 :13thage/large :13thage/wrecker [:13thage/beast]]
   ["Frenzy demon" 5 :13thage/normal :13thage/wrecker [:13thage/demon]]
   ["Gargoyle" 5 :13thage/normal :13thage/troop [:13thage/construct]]
   ["Gelatinous cube" 5 :13thage/huge :13thage/blocker [:13thage/ooze]]
   ["Half-orc tribal champion" 5 :13thage/normal :13thage/wrecker [:13thage/half-orc :13thage/humanoid]]
   ["Hobgoblin warmage" 5 :13thage/normal :13thage/caster [:13thage/goblin]]
   ["Huge white dragon" 5 :13thage/huge :13thage/troop [:13thage/dragon :13thage/white]]
   ["Hydra, 5 heads" 5 :13thage/huge :13thage/wrecker [:13thage/beast :13thage/hydra]]
   ["Medium blue dragon" 5 :13thage/normal :13thage/caster [:13thage/dragon :13thage/blue]]
   ["Sahuagin" 5 :13thage/normal :13thage/wrecker [:13thage/humanoid]]
   ["Wraith" 5 :13thage/normal :13thage/spoiler [:13thage/undead]]
   ["Wyvern" 5 :13thage/large :13thage/wrecker [:13thage/beast]]

   ["Clay golem" 6 :13thage/large :13thage/spoiler [:13thage/construct :13thage/golem]]
   ["Drider" 6 :13thage/large :13thage/caster [:13thage/abberation]]
   ["Hill giant" 6 :13thage/large :13thage/troop [:13thage/giant]]
   ["Large black dragon" 6 :13thage/large :13thage/wrecker [:13thage/dragon :13thage/black]]
   ["Manticore" 6 :13thage/large :13thage/archer [:13thage/beast]]
   ["Medium red dragon" 6 :13thage/normal :13thage/wrecker [:13thage/dragon :13thage/red]]
   ["Medusa" 6 :13thage/large :13thage/wrecker [:13thage/humanoid]]
   ["Vampire spawn" 6 :13thage/normal :13thage/spoiler [:13thage/undead :13thage/vampire]]
   ["Vrock" 6 :13thage/normal :13thage/spoiler [:13thage/demon]]

   ["Frost giant" 7 :13thage/large :13thage/spoiler [:13thage/giant]]
   ["Hezrou" 7 :13thage/large :13thage/troop [:13thage/demon]]
   #_["" 7 :13thage/normal ]
                                        ; todo
   ])


(defn vec->monster
  "The monster table (above) uses vectors for simplicity, but
   the actual search system uses monster maps to name everything."  
  [[name level size type attrs]]
  {:name name 
   :level level 
   :size size 
   :type type 
   :attrs attrs})

;; the follow functions define the rules that link the various maps above.

(defn adjustment 
  [level]
  (-> level level-tier tier-adjustment))


(defn relative-level
  [party monster]
  (let [monster-adjusted (- monster (adjustment party))]
    (- monster-adjusted party)))


(defn monster-scale
  [{:keys [size type]}]
  (println type size (= type :13thage/mook))
  (if (= type :13thage/mook) 
    :13thage/mook
    size))


(defn price-monster
  "Calculates the scale and cost of this monster for the current
   party level and associates them with the monster map.

   monsters that are not valid are replaced with nils"
  [party-level {:keys [level] :as m}]
  (let [cost (relative-cost (relative-level party-level level))
        scale (monster-scale m)
        mul (size-factor scale)]
    (if cost
      (assoc m 
        :scale scale
        :price (* mul cost))
      nil)))


(defn repeat-monster
  "Repeats a monster as many times as the available points will allow."
  [points {:keys [price] :as monster}]  
  (map (fn [n] [(repeat n monster) (- points (* n price))])
       (range 0 (inc (quot points price)))))


;; and the hard part in the absence of core.logic

(defn allocate-monsters*
  [points [m & monsters]]
  (when m
    (for [[ms remaining] (repeat-monster points m)
          [allocation allocated-remaining] (or (allocate-monsters* remaining monsters) 
                                               [[[] remaining]])
          :when (<= allocated-remaining 4)]
      [(into ms allocation) allocated-remaining])))

(defn allocate-monsters 
  [points monsters]
  (map first (allocate-monsters* points monsters)))

