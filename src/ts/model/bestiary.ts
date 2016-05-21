/// <reference path="../data.ts" />
/// <reference path="../messaging.ts" />
/// <reference path="../typed-workers.ts" /> 

module manticore.model {
    export type DataAccessWorker = workers.ITypedWorker<messaging.dataAccess.BestiaryMessage, messaging.dataAccess.BestiaryMessage>;
    
      export function dataAccessWorker():DataAccessWorker {
          return manticore.workers.newWorker<any, any>("static/js/data-access.js");
      }
} 
