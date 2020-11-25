import { GridEditMode, IEditField, IGridProps, IRowData } from './types-grid';
import { hasChanged, uuid } from './util';
import { IGridState } from './state';
import { IProgress, SyncAction } from './types-sync';

export interface IGridEditContext<TModel extends object> {
    editMode: GridEditMode;
    autoSave: boolean;

    isEditing: boolean;

    needsSave: boolean;
    syncProgress: IProgress | null;

    editField: IEditField | null;
    setEditField: (field: string | null, rowNumber: number | null) => void;

    updateRow: (rowData: IRowData<TModel>) => boolean;
    addRow: (model: TModel) => boolean;
    deleteRow: (rowData: IRowData<TModel>) => boolean;

    sync: () => void;
}

export function createEditingContext<TModel extends object>(
    state: IGridState<TModel>,
    props: IGridProps<TModel>
): IGridEditContext<TModel> | null {
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

function setCurrentEditField<TModel extends object>(
    field: string | null,
    rowNumber: number | null,
    state: IGridState<TModel>
) {
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
}

function updateRow<TModel extends object>(
    rowData: IRowData<TModel>,
    state: IGridState<TModel>,
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
    state: IGridState<TModel>,
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
    rowData: IRowData<TModel>,
    state: IGridState<TModel>,
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
