(ns manticore.interface
  (:require [om.core :as om :include-macros true]
            [om.dom :as dom :include-macros true]
            [clojure.string :as string]

            [manticore.bestiary :as bestiary]))

(enable-console-print!)

(def app-state
  (atom {:party {:level 1
                 :characters 1}
         
         :filters {:size #{}
                   :type #{}
                   :attributes #{}}

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
                        :onKeyDown #(let [key (.-keyCode %)] 
                                      (when-not (or (<= 48 key 57) ;; numeric ey
                                                    (<= 37 key 40) ;; arrow
                                                    (#{8 46} key)  ;; del, backspace
                                                    (.-altKey %) 
                                                    (.-metaKey %) 
                                                    (.-ctrlKey %))
                                        (.preventDefault %)))
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


;; filters section
(defn selection-view
  [data owner {:keys [title key choices]}]
  (reify om/IRender
    (render [_]
      (dom/div #js {:class (str "filter-group " 
                            (.toLowerCase title))

                    :onClick #(prn (.targetNode %))
                    }
               title
               (apply dom/ul nil
                (map (fn [k]
                       (dom/li nil (name k))) 
                     choices))))))


(defn filtering-view
  [app owner]
  (reify
    om/IRender
    (render [_]
      (dom/div nil 
               (dom/h2 nil "Filters")
               ;; copy and waste follow
               (om/build selection-view (get-in app [:filters :type])
                         {:opts {:title "Type"
                                 :choices (sort bestiary/all-types)}})
               (om/build selection-view (get-in app [:filters :size])
                         {:opts {:title "Size"
                                 :choices bestiary/all-sizes}})
               (om/build selection-view (get-in app [:filters :attributes])
                         {:opts {:title "Classifications"
                                 :choices (sort bestiary/all-attributes)}})))))


(om/root party-view app-state
         {:target (. js/document (getElementById "party"))})

(om/root filtering-view app-state
         {:target (. js/document (getElementById "filters"))})

