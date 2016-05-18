/// <reference path="../data.ts" />
/// <reference path="../messaging.ts" />
/// <reference path="../typed-workers.ts" /> 

module manticore.model {
      export function bestiaryWorker() {
          return manticore.workers.newWorker<any, any>("static/js/data-access.js");
      }
} 
