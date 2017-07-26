import * as data from "../common/data";
import * as messaging from "../common/messaging";
import * as workers from "../common/typed-workers";

export type DataAccessWorker = workers.ITypedWorker<messaging.dataAccess.DataAccessMessage, messaging.dataAccess.DataAccessMessage>;

export function dataAccessWorker():DataAccessWorker {
    return workers.newWorker<any, any>("static/js/data-access.js");
}
 
