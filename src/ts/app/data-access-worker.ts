import { data,  messaging, typedWorkers } from "common/index";

export type DataAccessWorker = typedWorkers.ITypedWorker<messaging.dataAccess.DataAccessMessage, messaging.dataAccess.DataAccessMessage>;

export function dataAccessWorker():DataAccessWorker {
    return typedWorkers.newWorker<any, any>("static/js/data-access.js");
}
 
