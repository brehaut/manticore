(defproject manticore "0.1.0-SNAPSHOT"
  :description "An encounter generator for 13th Age"
  :url "http://github.com/brehaut/manticore"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.6.0"]
                 [ring "1.2.1"]
                 [compojure "1.1.6"]
                 [enlive "1.1.5"]

                 [org.clojure/clojurescript "0.0-2197"
                  :exclusions [org.apache.ant/ant]]
                 [om "0.5.3"]]

  :source-paths ["src/clj" 
                 "src/cljs"]

  :profiles {:dev 
             {:repl-options {:init-ns manticore.dev}
              :plugins [[lein-cljsbuild "1.0.3"]
                        [com.cemerick/austin "0.1.4"]]
              :cljsbuild {:builds [{:id "dev"
                                    :source-paths ["src/cljs"]
                                    :compiler {:output-to "target/classes/public/app.js"
                                               :optimizations :simple}}
                                   
                                   {:id "release"
                                    :source-paths ["src/cljs"]
                                    :compiler {:output-to "target/classes/public/app.js"
                                               :optimizations :advanced
                                               :pretty-print false
                                               :preamble ["react/react.min.js"]
                                               :externs ["react/externs/react.js"]}}]}}})

