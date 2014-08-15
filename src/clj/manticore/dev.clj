(ns manticore.dev
  (:require [cemerick.austin.repls :refer (browser-connected-repl-js)]
            [net.cgrand.enlive-html :as enlive]
            [compojure.route :refer (resources files)]
            [compojure.core :refer (GET defroutes)]  
            ring.adapter.jetty
            [clojure.java.io :as io]))

(enlive/deftemplate page
  (io/resource "index.html")
  []
  [:body] (enlive/append
            (enlive/html [:script (browser-connected-repl-js)])))

(defroutes site
  (resources "/") 
  (files "/static/" {:root "static"})
  (GET "/" req (page)))

(defn run
  []
  (defonce ^:private server
    (ring.adapter.jetty/run-jetty #'site {:port 8080 :join? false}))
  server)

(defn repl-up
  []
  (do (reset! cemerick.austin.repls/browser-repl-env
                        (cemerick.austin/repl-env))
      :repl-env-up))

(defn cljs 
  [] 
  (cemerick.austin.repls/cljs-repl @cemerick.austin.repls/browser-repl-env))