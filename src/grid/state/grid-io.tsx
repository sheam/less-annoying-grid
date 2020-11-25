/* tslint:disable:jsx-no-multiline-js */
import * as React from 'react';
import {
    GridEditMode,
    IDataResult,
    IDataState,
    IEditField,
    IFieldFilter,
    IGridProps,
    IPagination,
    IProgress,
    IRowData,
    ISortColumn,
    ISyncData,
    ISyncDataResult,
    SyncAction,
} from '../types';
import { hasChanged, uuid } from '../util';
import { IGridState } from './state';

export interface IGridEditContext {
    editMode: GridEditMode;
    autoSave: boolean;

    isEditing: boolean;

    needsSave: boolean;
    syncProgress: IProgress | null;

    editField: IEditField | null;
    setEditField: (field: string | null, rowNumber: number | null) => void;

    updateRow: (rowData: IRowData) => boolean;
    addRow: (model: any) => boolean;
    deleteRow: (rowData: IRowData) => boolean;

    sync: () => void;
}

export function createEditingContext<TModel extends object>(
    state: IGridState,
    props: IGridProps<TModel>
): IGridEditContext | null {
    if (!props.editable) {
        return null;
    }

    return {
        isEditing: state.isEditing,
        needsSave: state.needsSave,
        syncProgress: state.syncProgress,
        editField: state.editField,
        setEditField: (f, rn) => setCurrentEditField(f, rn, state),
        updateRow: rowData => updateRow(rowData, state, props),
        addRow: model => addRow(model, state, props),
        deleteRow: rowData => deleteRow(rowData, state, props),
        editMode: props.editable.editMode,
        autoSave: props.editable.autoSave,
        sync: () => state.setSaveRequested(true),
    };
}

export function syncDataEffect<TModel extends object>(
    state: IGridState,
    props: IGridProps<TModel>
) {
    const sync = async () => {
        const result = await syncChanges(state, props);
        state.setNeedsSave(false);
        return result;
    };
    if (state.saveRequested) {
        state.setSaveRequested(false);
        sync();
    }
}

export function loadDataEffect<TModel extends object>(
    state: IGridState,
    getDataAsync: (
        p: IPagination | null,
        s: ISortColumn | null,
        f: IFieldFilter[]
    ) => Promise<IDataResult<TModel>>
) {
    const fetch = async () => {
        const d = await getDataAsync(
            state.pagination,
            state.sort,
            state.filters
        );
        const newState: IDataState = {
            totalCount: d.totalCount,
            data: d.data.map((m, i) => {
                const result: IRowData = {
                    syncAction: SyncAction.unchanged,
                    model: m,
                    rowNumber: i + 1,
                    rowId: uuid(),
                };
                return result;
            }),
        };
        state.setDataState(newState);
        state.setIsLoading(false);
    };

    state.setIsLoading(true);

    // noinspection JSIgnoredPromiseFromCall
    fetch();
}

function updateRow<TModel extends object>(
    rowData: IRowData,
    state: IGridState,
    props: IGridProps<TModel>
): boolean {
    const data = state.dataState.data;
    const existingRow = data.find(r => r.rowNumber === rowData.rowNumber);
    if (!existingRow) {
        throw new Error(`unable to find row with id=${rowData.rowNumber}`);
    }
    existingRow.syncAction = rowData.syncAction;
    existingRow.model = rowData.model;

    data.forEach((r, i) => (r.rowNumber = i + 1));
    state.setNeedsSave(state.needsSave || hasChanged(rowData));
    state.setDataState(state.dataState);

    if (props.editable?.autoSave) {
        state.setSaveRequested(true);
    }

    return true; //success
}

function addRow<TModel extends object>(
    model: TModel,
    state: IGridState,
    props: IGridProps<TModel>
): boolean {
    const data = state.dataState.data;
    const newRow = {
        rowId: uuid(),
        model,
        syncAction: SyncAction.added,
        rowNumber: -1,
    };

    if (props.editable?.addToBottom) {
        data.push(newRow);
    } else {
        data.unshift(newRow);
    }

    data.forEach((r, i) => (r.rowNumber = i + 1));
    state.setDataState({ data, totalCount: state.dataState.totalCount + 1 });

    if (props.editable?.autoSave) {
        state.setSaveRequested(true);
    }

    return true; //success
}

function deleteRow<TModel extends object>(
    rowData: IRowData,
    state: IGridState,
    props: IGridProps<TModel>
): boolean {
    const data = state.dataState.data;
    const existingRow = data.find(r => r.rowNumber === rowData.rowNumber);
    if (!existingRow) {
        throw new Error(`unable to find row with id=${rowData.rowNumber}`);
    }
    existingRow.syncAction = SyncAction.deleted;
    existingRow.model = rowData.model;
    existingRow.rowNumber = -1;

    //renumber non-deleted
    data.filter(r => r.syncAction !== SyncAction.deleted).forEach(
        (r, i) => (r.rowNumber = i + 1)
    );

    state.setDataState({ data, totalCount: state.dataState.totalCount - 1 });
    state.setNeedsSave(state.needsSave || hasChanged(rowData));

    if (props.editable?.autoSave) {
        state.setSaveRequested(true);
    }

    return true; //success
}

const setCurrentEditField = (
    field: string | null,
    rowNumber: number | null,
    state: IGridState
) => {
    if (field && rowNumber) {
        const row = state.dataState.data.find(r => r.rowNumber === rowNumber);
        if (row) {
            state.setEditField({ rowId: row.rowId, field });
            state.setIsEditing(true);
        } else {
            state.setEditField(null);
            state.setIsEditing(false);
        }
    } else {
        state.setEditField(null);
        state.setIsEditing(false);
    }
};

async function syncChanges<TModel extends object>(
    state: IGridState,
    props: IGridProps<TModel>
): Promise<ISyncDataResult<TModel>[]> {
    if (!props.editable) {
        throw new Error(
            'attempt to call syncChanges when grid is not editable'
        );
    }
    if (state.syncProgress) {
        throw new Error(
            'attempt to call syncChanges when sync already in progress'
        );
    }

    const changes = state.dataState.data
        .filter(r => hasChanged(r))
        .map(r => {
            const result: ISyncData<TModel> = {
                model: r.model,
                rowId: r.rowId,
                syncAction: r.syncAction,
            };
            return result;
        });
    state.setSyncProgress({
        current: 0,
        total: changes.length,
        message: 'starting sync',
    });

    const applyUpdates = (
        p: IProgress,
        interim?: Array<ISyncDataResult<TModel>>
    ) => _applySyncResults(state, p, interim);

    try {
        const result = await props.editable.syncChanges(changes, applyUpdates);
        _applySyncResults(state, null, result);
        return result;
    } finally {
        state.setSyncProgress(null);
        console.log('done saving');
    }
}

export function _applySyncResults<TModel extends object>(
    state: IGridState,
    progress: IProgress | null,
    results: Array<ISyncDataResult<TModel>> | undefined
): void {
    if (progress) {
        state.setSyncProgress(progress);
    }
    const data = state.dataState.data;
    if (results) {
        for (let r of results) {
            if (!r.success) {
                continue;
            }
            const index = data.findIndex(er => er.rowId === r.rowId);
            if (index < 0) {
                //we may have already updated this one.
                continue;
            }
            if (r.syncAction === SyncAction.deleted) {
                state.dataState.data.splice(index, 1);
            } else {
                state.dataState.data[index] = {
                    model: r.model,
                    syncAction: SyncAction.unchanged,
                    rowNumber: data[index].rowNumber,
                    rowId: uuid(),
                };
            }
        }
        state.setDataState(state.dataState);
    }
}
