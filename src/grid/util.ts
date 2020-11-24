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
