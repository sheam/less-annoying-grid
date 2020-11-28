import { GridEditMode, IEditField, IGridProps, IRowData } from './types-grid';
import { getNewSyncAction, uuid } from './util';
import { IGridState } from './state';
import { IProgress, SyncAction } from './types-sync';
import { Column } from './columns/types';
import { validateModel } from './columns/validation';

export interface IGridEditContext<TModel extends object>
{
    editMode: GridEditMode;
    autoSave: boolean;

    needsSave: boolean;
    syncProgress: IProgress | null;
    validationErrors: boolean;

    editField: IEditField | null;
    setEditField: (field: string | null, rowNumber: number | null) => void;

    updateRow: (rowId: string, model: TModel) => IRowData<TModel>;
    addRow: (model?: TModel) => IRowData<TModel>;
    deleteRow: (rowId: string) => void;
    revertAll: () => void;
    revertRow: (rowId: string) => void;

    sync: () => void;
}

export function createEditingContext<TModel extends object>(
    state: IGridState<TModel>,
    props: IGridProps<TModel>
): IGridEditContext<TModel> | null
{
    if (!props.editable)
    {
        return null;
    }

    return {
        needsSave: state.needsSave,
        syncProgress: state.syncProgress,
        editField: state.editField,
        setEditField: (f, rn) => setCurrentEditField(f, rn, state),
        updateRow: (rowId, model) => updateRow(rowId, model, state, props),
        addRow: (model?: TModel) =>
            addRow(model || createNewRow(props.columns), state, props),
        deleteRow: rowData => deleteRow(rowData, state, props),
        editMode: props.editable.editMode,
        autoSave: props.editable.autoSave,
        sync: () => state.setSaveRequested(true),
        validationErrors: state.validationErrors,
        revertAll: () => revertRows(state.dataState.data.map(r => r.rowId), state),
        revertRow: (r) => revertRows([r], state),
    };
}

function setCurrentEditField<TModel extends object>(
    field: string | null,
    rowNumber: number | null,
    state: IGridState<TModel>
)
{
    if (field && rowNumber)
    {
        const row = state.dataState.data.find(r => r.rowNumber === rowNumber);
        if (row)
        {
            state.setEditField({ rowId: row.rowId, field });
        } else
        {
            state.setEditField(null);
        }
    } else
    {
        state.setEditField(null);
    }
}

//exported for testing only
export function updateRow<TModel extends object>(
    rowId: string,
    model: TModel,
    state: IGridState<TModel>,
    props: IGridProps<TModel>
): IRowData<TModel>
{
    const data = state.dataState.data;
    const index = data.findIndex(r => r.rowId === rowId);
    if (index < 0)
    {
        throw new Error(`unable to find row with id=${rowId}`);
    }
    const existingRow = data[index];
    if (deepEqual(existingRow.model, model))
    {
        return existingRow; //no changes
    }

    const newRow = Object.assign({}, existingRow);
    newRow.model = model;
    newRow.syncAction = getNewSyncAction(existingRow.syncAction, SyncAction.updated);

    data[index] = newRow;
    data.forEach((r, i) => (r.rowNumber = i + 1));
    setValidation(newRow, props.columns, state);
    state.setNeedsSave(true);
    state.setDataState({ totalCount: state.dataState.totalCount, data });

    if (props.editable?.autoSave)
    {
        state.setSaveRequested(true);
    }

    return newRow;
}

function deepEqual(a: any, b: any): boolean
{
    return JSON.stringify(a) === JSON.stringify(b);
}

//exported for testing only
export function addRow<TModel extends object>(
    model: TModel,
    state: IGridState<TModel>,
    props: IGridProps<TModel>
): IRowData<TModel>
{
    const data = state.dataState.data;
    const newRow: IRowData<TModel> = {
        rowId: uuid(),
        model,
        syncAction: SyncAction.added,
        rowNumber: -1,
        showDetail: false,
        originalModel: model,
    };

    if (props.editable?.addToBottom)
    {
        data.push(newRow);
    } else
    {
        data.unshift(newRow);
    }

    data.forEach((r, i) => (r.rowNumber = i + 1));
    state.setNeedsSave(true);
    setValidation(newRow, props.columns, state);
    state.setDataState({ data, totalCount: state.dataState.totalCount });

    if (props.editable?.autoSave)
    {
        state.setSaveRequested(true);
    }

    return newRow; //success
}

//exported for testing only
export function deleteRow<TModel extends object>(
    rowId: string,
    state: IGridState<TModel>,
    props: IGridProps<TModel>
): void
{
    const data = state.dataState.data;
    const existingRow = data.find(r => r.rowId === rowId);
    if (!existingRow)
    {
        throw new Error(`unable to find row with id=${rowId}`);
    }
    if (existingRow.syncAction === SyncAction.deleted)
    {
        return;
    }

    existingRow.syncAction = SyncAction.deleted;
    existingRow.rowNumber = -1;

    //renumber non-deleted
    data.filter(r => r.syncAction !== SyncAction.deleted).forEach(
        (r, i) => (r.rowNumber = i + 1)
    );

    state.setDataState({ data, totalCount: state.dataState.totalCount });
    state.setNeedsSave(true);

    if (props.editable?.autoSave)
    {
        state.setSaveRequested(true);
    }
}

function revertRows<TModel extends object>(
    revertRowIdList: Array<string>,
    state: IGridState<TModel>
): void
{
    const existingData = state.dataState.data;
    const newData = new Array<IRowData<TModel>>();
    for (let existingRow of existingData)
    {
        const index = revertRowIdList.indexOf(existingRow.rowId);
        if (index < 0 || existingRow.syncAction === SyncAction.unchanged)
        {
            //not reverting this row, so just copy it into new state
            newData.push(existingRow);
            continue;
        }

        if (existingRow.syncAction === SyncAction.added)
        {
            //leave out added rows
            continue;
        }

        existingRow.model = existingRow.originalModel;
        existingRow.syncAction = SyncAction.unchanged;
    }

    //renumber non-deleted
    existingData.forEach(
        (r, i) => (r.rowNumber = i + 1)
    );

    state.setDataState({ totalCount: state.dataState.totalCount, data: existingData });
}

function setValidation<TModel extends object>(
    rowData: IRowData<TModel>,
    columns: Array<Column<TModel>>,
    state: IGridState<TModel>
): void
{
    rowData.validationErrors = null;

    const errors = validateModel(rowData.model, columns);
    if (errors?.length > 0)
    {
        rowData.validationErrors = errors;
        state.setValidationErrors(true);
    }
}

function createNewRow<TModel extends object>(
    columns: Array<Column<TModel>>
): TModel
{
    const model: any = {};

    columns.forEach(c =>
    {
        if (c.type === 'data' && c.defaultValue !== undefined)
        {
            model[c.field] =
                typeof c.defaultValue === 'function'
                    ? c.defaultValue()
                    : c.defaultValue;
        }
    });

    return model as TModel;
}
