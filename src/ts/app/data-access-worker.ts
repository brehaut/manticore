/// <reference types="common" />
import data = manticore.common.data;
import messaging = manticore.common.messaging;
import typedWorkers = manticore.common.typedWorkers;

export type DataAccessWorker = typedWorkers.ITypedWorker<messaging.dataAccess.DataAccessMessage, messaging.dataAccess.DataAccessMessage>;

export function dataAccessWorker():DataAccessWorker {
    return typedWorkers.newWorker<any, any>("static/js/data-access.js");
}
 
