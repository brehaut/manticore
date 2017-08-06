const fs = require("fs");
const vm = require("vm");
const path = require("path");
/* What on earth is going on here? 
 * 
 * manticore is a web app, not a node app. some of its assumptions about how the code will be
 * loaded are a poor fit for the node environment. As a result, this code needs to route 
 * around those mismatches.
 * 
 *  -  importScripts is approximately the web worker importScripts function
 *     (a very poor approximation though).
 *  -  requireWithGlobal is an approximation of node's require but with the 
 *     addition of manticore specific global objects. This is important for
 *     the dynamic linking via global names that the common library expects
 */

var importScripts = function(path) {
  vm.runInThisContext(fs.readFileSync("dist/static/js/" + path, 'utf8'), path);
};

// bring in common.js so that we can connect the manticore namespace
// in requireWithGlobal's global context.
importScripts("common.js");

var requireWithGlobal = function(script) {
  const systemRequire = require;

  const global = {
    manticore: manticore,
    require: requireWithGlobal,
    exports: {}
  };
  
  const normalized = path.normalize(script + ".js")
  const dir = path.dirname(normalized);
  const filename = path.basename(normalized)
  process.chdir(dir)

  // TODO: if this all fails, fall back to just using require
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), global, filename);

  return global.exports;
}


exports.importScripts = importScripts;
exports.requireWithGlobal = requireWithGlobal;