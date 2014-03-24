(ns manticore.bestiary
  (:require [clojure.core.logic :as l]            
            [clojure.core.logic.fd :as fd]))

 ;; The following relations encodes the Monster Equivalents 
 ;; table from 13th Age as a set of relations

(l/defne size-factor
  "A cost multipler for monster size"
  [size factor]
  ([:13thage/mook 1])
  ([:13thage/normal 5])
  ([:13thage/large 10])
  ([:13thage/huge 15]))


(l/defne tier-adjustment 
  "The adjustment for relative levels based on tier.

   At champion tier, an monster of equivalent level is 
   consider to be one cost grade lower than the party for instance.
  "
  [tier adjustment]
  ([:13thage/adventurer 0])
  ([:13thage/champion 1])
  ([:13thage/epic 2]))


(l/defne level-tier 
  "Maps levels to tiers."
  [tier level]
  ([:13thage/adventurer 1])
  ([:13thage/adventurer 2])
  ([:13thage/adventurer 3])
  ([:13thage/adventurer 4])
  ([:13thage/champion 5])
  ([:13thage/champion 6])
  ([:13thage/champion 7])
  ([:13thage/epic 8])
  ([:13thage/epic 9])
  ([:13thage/epic 10]))


(l/defne relative-cost 
  "Produces the base relative cost for a monster with respect
   to it the party level. All costs are relative to adventurer
   tier. Use the tier-adjustment to correct for appropriate tier.
   "
  [level-different cost]
   ;; note:13thage/ these numbers are scaled up by 40 so that   
   ;; so that when multipled by size-factor (above) 
   ;; they are all integers.
  ([-2 2])
  ([-1 3])
  ([0 4])
  ([1 6])
  ([2 8])
  ([3 12])
  ([4 16]))

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
   ["Dretch" 3 :normal :13thage/mook [:13thage/demon]]
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


(defn adjustmento [level adj] 
  "looks up the adjustment for the given party level"
  (l/fresh [char-tier]  
           (level-tier char-tier level) 
           (tier-adjustment char-tier adj)))


(defn relative-levelo [party monster relative]
  "the relative level between the party and a monster.

   this relation takes into account the tier adjustment. This
   results in all relative levels being scaled from -2 to 4.

   If the level is outside the parameters of a valid fight, the 
   relation fails
  "
  (l/fresh [adjust monster-adjusted]
           (fd/in party
                  monster
                  monster-adjusted
                  (fd/interval 0 20))
           (fd/in adjust (fd/interval 0 2))
           (fd/in relative 
                  (fd/interval -2 4))

           (adjustmento party adjust)
           (fd/- monster adjust monster-adjusted)
           (fd/- monster-adjusted party relative)))


(defn monster-costo [party-level level size cost]
  (l/fresh [rel-lev rel-cost mul]
           (fd/in cost (fd/interval 0 (* 3 32)))
           (relative-levelo party-level level rel-lev)
           (relative-cost rel-lev rel-cost)
           (size-factor size mul)
           (fd/* rel-cost mul cost)))


(l/defne monster-scalero [size type scale]
  ([:13thage/normal :13thage/mook :13thage/mook])
  ([size type size]
     (l/!= type :13thage/mook)))

(defn price-monsterso [party-level monsters priced]
  (l/conde 
   [(l/emptyo monsters)
    (l/emptyo priced)]
   [(l/fresh [name level size type scale _
              cost 
              monsters-tail tail]
             (fd/in cost (fd/interval 0 (* 3 32)))
             (l/conso [name level size type _] monsters-tail monsters)
             (price-monsterso party-level monsters-tail tail)

             #_(monster-scalero size type scale)

             (l/conda
              [(monster-costo party-level level scale cost)
               (l/conso [name cost] tail priced)]
              [(l/== tail priced)]))]))


(def max-points 
  "Defines the max number of points an encounter could cost.
   Assumes 8 players is a really big number and multiplies that 
   against the cost for one normal sized equal level encounter."
  (* 20 8))


(defn repeato*
  "repeato repeats a monster as many time as points allows."
  [points monster remaining-points monsters]
  (l/fresh [name cost tail r]
           (l/== [name cost] monster)
           (fd/in cost
                  points
                  remaining-points
                  r
                  (fd/interval 0 max-points))           
           (fd/<= cost points)
           
           (l/conde 
            [(fd/- points cost remaining-points)
             (l/conso name [] monsters)]
            [(fd/- points cost r)
             (repeato* r monster remaining-points tail)
             (l/conso name tail monsters)])))


(defn repeato [points monster remaining-points repeated]
  "Repeats a monster as many times as points allow, and
   includes the case where no points are spent.
  "
  (l/conde
   [(l/== points remaining-points)
    (l/== repeated ())]
   [(repeato* points monster remaining-points repeated)]))


(defn allocate-monsterso
  "Allocates points to monsters by cost."
  [points monsters unspent-points allocation]
  (l/conde
   [(l/emptyo monsters)
    (l/emptyo allocation)
    (l/== points unspent-points)]
   [(l/fresh [monster 
              monsters-tail 
              repeated 
              remaining-points 
              tail]
             (fd/in points 
                    remaining-points
                    unspent-points
                    (fd/interval 0 max-points))
             (l/conso monster monsters-tail monsters)
             (repeato points monster remaining-points repeated)
             (allocate-monsterso remaining-points monsters-tail 
                                 unspent-points tail)
             (fd/<= unspent-points 8)
             (l/appendo repeated tail allocation))]))


(defn -main
  "I don't do a whole lot."
  [& args]
  (println "Hello, World!"))
