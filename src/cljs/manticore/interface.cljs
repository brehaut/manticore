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


(defn handle-numeric-change 
  [e data edit-key cur]
  (let [v (.. e -target -value)]
    (if (.match v #"^\d+$")
      (om/update! data edit-key (js/parseInt v 10))
      (om/update! data edit-key cur))))


;; party section
(defn number-field
  [data owner {:keys [edit-key]}]
  (reify om/IRender
    (render [_]
      (let [v (om/value (edit-key data))]
        (dom/input #js {:value v
                        :onKeyDown #(when-not (<= 48 (.-keyCode %) 57)
                                      (.preventDefault %))
                        :onChange #(handle-numeric-change % data edit-key v)})))))


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
