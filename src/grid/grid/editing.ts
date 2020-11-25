import { GridEditMode, IEditField, IGridProps, IRowData } from './types';
import { hasChanged, uuid } from './util';
import { IGridState } from './state';
import { IProgress, SyncAction } from './sync';

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
