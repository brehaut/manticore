(ns manticore.interface
  (:require [om.core :as om :include-macros true]
            [om.dom :as dom :include-macros true]
            [clojure.string :as string]))

(enable-console-print!)

(def app-state
  (atom {:party {:level 1
                 :characters 1}
         
         :filters {}

         :sort {}
         }))


(defn handle-change [e data edit-key owner]
  (om/transact! data edit-key (fn [_] (.. e -target -value))))

;; party section
(defn number-field
  [data owner {:keys [edit-key]}]
  (reify om/IRender
    (render [_]
      (dom/input #js {:value (om/value (edit-key data))
                      :onChange (fn handle-change [e]
                                  (let [v (.. e -target -value)]
                                    (when (.match v #"\d+")
                                      (om/update! data edit-key (js/parseInt v 10)))))}))))

(defn party-view 
  [app owner]
  (reify
     om/IRender
    (render [_]
      (dom/div nil
               "Characters: " (om/build number-field
                                        (app :party)
                                        {:opts {:edit-key :characters}})       
               " Level: " (om/build number-field 
                                    (app :party)
                                    {:opts {:edit-key :level}})))))

(om/root party-view app-state
  {:target (. js/document (getElementById "party"))})
