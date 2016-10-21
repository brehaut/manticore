/// <reference path="../common/data.ts" />
/// <reference path="../common/messaging.ts" />
/// <reference path="../common/typed-workers.ts" /> 

module manticore.model {
    export type DataAccessWorker = workers.ITypedWorker<messaging.dataAccess.DataAccessMessage, messaging.dataAccess.DataAccessMessage>;
    
      export function dataAccessWorker():DataAccessWorker {
          return manticore.workers.newWorker<any, any>("static/js/data-access.js");
      }
} 
