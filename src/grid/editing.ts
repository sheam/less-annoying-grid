import { Direction, IGridProps, IRowData } from './types-grid';
import { deepEqual, getNewSyncAction, shallowClone, uuid } from './util';
import { IGridState } from './state';
import { SyncAction } from './types-sync';
import { Column, IDataColumn } from './columns/types';
import { validateModel } from './columns/validation';

export function advanceEditField<TSummaryModel extends object>(state: IGridState<TSummaryModel>, columns: Array<Column<TSummaryModel>>, direction: Direction)
{
    if (!state.editField || direction === Direction.none)
    {
        return;
    }

    const data = state.dataState.data;
    const dataColumns = columns.filter(c => c.type === 'data' && c.editable) as Array<IDataColumn<TSummaryModel>>;

    let colIndex = dataColumns.findIndex(c => c.field === state.editField?.field);
    if (colIndex < 0)
    {
        throw new Error(
            'could not find the field that was just being edited'
        );
    }

    //first-most edit field case
    let row = state.editField.rowData;
    if (colIndex === 0 && row.rowNumber === 1 && direction === Direction.backward)
    {
        state.setEditField(null);
        return;
    }

    //last-most edit field case
    if (colIndex === dataColumns.length - 1 && row.rowNumber === data.length && direction === Direction.forward)
    {
        state.setEditField(null);
        return;
    }

    if (direction === Direction.forward && colIndex === dataColumns.length - 1)
    {
        colIndex = 0;
        row = data[row.rowNumber];
    }
    else if (direction === Direction.backward && colIndex === 0)
    {
        colIndex = dataColumns.length - 1;
        row = data[row.rowNumber - 2];
    }
    else
    {
        const searchIncrement = direction === Direction.forward ? 1 : -1;
        colIndex = colIndex + searchIncrement;
    }

    const nextCol = dataColumns[colIndex];
    if (!row || !nextCol)
    {
        throw new Error('error trying to determine next edit field');
    }

    state.setEditField({ field: nextCol.field, rowData: row });
}

//exported for testing only
export function updateRow<TSummaryModel extends object, TEditModel extends object>(
    rowId: string,
    model: TEditModel,
    state: IGridState<TSummaryModel>,
    props: IGridProps<TSummaryModel, TEditModel>
): IRowData<TSummaryModel>
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
    newRow.model = (model as any) as TSummaryModel;
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

//exported for testing only
export function addRow<TSummaryModel extends object, TEditModel extends object>(
    model: TEditModel,
    state: IGridState<TSummaryModel>,
    props: IGridProps<TSummaryModel, TEditModel>
): IRowData<TSummaryModel>
{
    const data = state.dataState.data;
    const newRow: IRowData<TSummaryModel> = {
        rowId: uuid(),
        model: model as any,
        syncAction: SyncAction.added,
        rowNumber: -1,
        showDetail: false,
        originalModel: model as any,
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

    state.setEditField({ rowData: newRow, field: null });

    if (props.editable?.autoSave)
    {
        state.setSaveRequested(true);
    }

    return newRow; //success
}

//exported for testing only
export function deleteRow<TSummaryModel extends object, TEditModel extends object>(
    rowId: string,
    state: IGridState<TSummaryModel>,
    props: IGridProps<TSummaryModel, TEditModel>
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

// exported only for testing
export function revertRows<TSummaryModel extends object>(
    revertRowIdList: Array<string>,
    state: IGridState<TSummaryModel>
): void
{
    const existingData = state.dataState.data;
    const newData = new Array<IRowData<TSummaryModel>>();
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

        existingRow.model = shallowClone(existingRow.originalModel);
        existingRow.syncAction = SyncAction.unchanged;
        existingRow.validationErrors = null;

        newData.push(existingRow);
    }

    //renumber non-deleted
    newData.forEach(
        (r, i) => (r.rowNumber = i + 1)
    );

    const hasChanges = newData.findIndex(r => r.syncAction !== SyncAction.unchanged) >= 0;
    const hasErrors = newData.findIndex(r => r.validationErrors && r.validationErrors.length > 0) >= 0;
    state.setDataState({ totalCount: state.dataState.totalCount, data: newData });
    state.setValidationErrors(hasErrors);
    state.setNeedsSave(hasChanges);
}

function setValidation<TSummaryModel extends object>(
    rowData: IRowData<TSummaryModel>,
    columns: Array<Column<TSummaryModel>>,
    state: IGridState<TSummaryModel>
): void
{
    rowData.validationErrors = null;

    const errors = validateModel(rowData.model, columns);
    if (errors?.length > 0)
    {
        rowData.validationErrors = errors;
        state.setValidationErrors(true);
    }
    else
    {
        const hasErrors = state.dataState.data.findIndex(r => r.validationErrors && r.validationErrors.length > 0) >= 0;
        state.setValidationErrors(hasErrors);
    }
}

export function createNewRow<TSummaryModel extends object>(
    columns: Array<Column<TSummaryModel>>
): TSummaryModel
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

    return model as TSummaryModel;
}
