import { IRowData, SyncAction } from './types';

export function cloneData<TModel>(model: TModel): TModel {
    return JSON.parse(JSON.stringify(model));
}

export function getNewSyncAction(
    current: SyncAction,
    newAction: SyncAction
): SyncAction {
    if (newAction === SyncAction.unchanged) {
        return current;
    }

    if (current === SyncAction.unchanged) {
        if (newAction === SyncAction.updated) {
            return newAction;
        }
    }

    if (current === SyncAction.added) {
        if (newAction === SyncAction.updated) {
            return current;
        }
    }

    if (current === SyncAction.updated) {
        if (
            newAction === SyncAction.deleted ||
            newAction === SyncAction.updated
        ) {
            return newAction;
        }
    }

    throw new Error(
        `new '${newAction}' state not supported on an '${current}' row`
    );
}

export const hasChanged = (rowData: IRowData) =>
    rowData.syncAction !== SyncAction.unchanged;

//stealing from interwebs until next ES release which is supposed to have UID module
export function uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8; // eslint-disable-line
        return v.toString(16);
    });
}
