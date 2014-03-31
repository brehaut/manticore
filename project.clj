(defproject manticore "0.1.0-SNAPSHOT"
  :description "An encounter generator for 13th Age"
  :url "http://github.com/brehaut/manticore"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.5.1"]
                 [org.clojure/core.logic "0.8.7"]
                 [org.clojure/clojurescript "0.0-2156"
                  :exclusions [org.apache.ant/ant
                               org.clojure/clojure]]]

  :source-paths ["src/clj" 
                 "src/cljs"]

  :cljsbuild {
    :builds [{
        :source-paths ["src/cljs"]
        :compiler {
          :output-to "target/main.js" 
          :optimizations :whitespace
          :pretty-print true}}]}

  :profiles {:dev {:plugins [[lein-cljsbuild "1.0.2"]
                             [com.cemerick/austin "0.1.4"]]}})
