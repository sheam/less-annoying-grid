import { GridEditMode, IDataState, IGridProps, IRowData } from "../types-grid";
import { IGridState } from "../state";
import { addRow, deleteRow, updateRow } from "../editing";
import * as mock from './mock-data'
import { getData } from './mock-data'
import { SyncAction } from "../types-sync";
import { cloneData, shallowClone } from "../util";

interface IData
{
    key: number;
    name: string;
}

function getDefaultProps(): IGridProps<IData>
{
    return {
        columns: [
            {
                type: 'data',
                field: 'key',
                name: 'Key'
            },
            {
                type: 'data',
                field: 'name',
                name: 'Name'
            },
        ],
        getDataAsync: jest.fn(),
        editable: {
            editMode: GridEditMode.inline,
            autoSave: false,
            syncChanges: jest.fn(),
        }
    };
}

function getDefaultState(): IGridState<IData>
{
    const result: IGridState<IData> = {
        pagination: null,
        setPagination: jest.fn(),
        dataState: { totalCount: 0, data: [] },
        setDataState: jest.fn(),
        sort: null,
        setSort: jest.fn(),
        filters: [],
        setFilters: jest.fn(),
        editField: null,
        setEditField: jest.fn(),
        syncProgress: null,
        setSyncProgress: jest.fn(),
        needsSave: false,
        setNeedsSave: jest.fn(),
        isLoading: false,
        setIsLoading: jest.fn(),
        saveRequested: false,
        setSaveRequested: jest.fn(),
        validationErrors: false,
        setValidationErrors: jest.fn(),
    };
    const dataResult = getData(result.pagination, result.sort, result.filters);
    const rows: IRowData<IData>[] = dataResult.data.map((d, i) =>
    {
        const row: IRowData<IData> = {
            rowNumber: i + 1,
            rowId: `id-${i + 1}`,
            model: d,
            syncAction: SyncAction.unchanged,
            showDetail: false,
            validationErrors: null,
            originalModel: shallowClone(d),
        };
        return row;
    });
    result.dataState = { totalCount: dataResult.totalCount, data: rows };
    return result;
}

const totalData = 100;
const pageSize = totalData;

beforeEach(() => mock.resetData(totalData));

it('add row: autosave=false', () =>
{
    const props = getDefaultProps();
    const state = getDefaultState();
    if (!props || !state || !props.editable)
    {
        throw new Error('props or state null');
    }
    props.editable.autoSave = false;

    const modelToAdd: IData = { key: 0, name: 'new-guy' };

    state.setDataState = jest.fn().mockImplementation((newState: IDataState<IData>) =>
    {
        expect(newState.data.length).toBe(pageSize + 1);
        expect(newState.totalCount).toBe(totalData);
        expect(newState.data[0].rowNumber).toBe(1);
        expect(newState.data[0].showDetail).toBeFalsy();
        expect(newState.data[0].rowId).toBeTruthy();
        expect(newState.data[0].model).not.toBeNull();
        expect(newState.data[0].model.key).toBe(modelToAdd.key);
        expect(newState.data[0].model.name).toBe(modelToAdd.name);
        expect(newState.data[0].validationErrors).toBeFalsy();
    });

    addRow(modelToAdd, state, props);

    expect(state.setDataState).toHaveBeenCalledTimes(1);
    expect(state.setNeedsSave).toHaveBeenLastCalledWith(true);
    expect(state.setSaveRequested).toHaveBeenCalledTimes(0);
});

it('add row: autosave=true', () =>
{
    const props = getDefaultProps();
    const state = getDefaultState();
    if (!props || !state || !props.editable)
    {
        throw new Error('props or state null');
    }
    props.editable.autoSave = true;

    const modelToAdd: IData = { key: 0, name: 'new-guy' };

    state.setDataState = jest.fn().mockImplementation((newState: IDataState<IData>) =>
    {
        expect(newState.data.length).toBe(pageSize + 1);
        expect(newState.totalCount).toBe(totalData);
        expect(newState.data[0].rowNumber).toBe(1);
        expect(newState.data[0].showDetail).toBeFalsy();
        expect(newState.data[0].rowId).toBeTruthy();
        expect(newState.data[0].model).not.toBeNull();
        expect(newState.data[0].model.key).toBe(modelToAdd.key);
        expect(newState.data[0].model.name).toBe(modelToAdd.name);
        expect(newState.data[0].validationErrors).toBeFalsy();
    });

    addRow(modelToAdd, state, props);

    expect(state.setDataState).toHaveBeenCalledTimes(1);
    expect(state.setNeedsSave).toHaveBeenLastCalledWith(true);
    expect(state.setSaveRequested).toHaveBeenLastCalledWith(true);
});

it('update row: autosave=false', () =>
{
    const props = getDefaultProps();
    const state = getDefaultState();
    if (!props || !state || !props.editable)
    {
        throw new Error('props or state null');
    }
    props.editable.autoSave = false;

    const index = 3;
    const originalRow = cloneData(state.dataState.data[index]);
    const updatedRow = cloneData(state.dataState.data[index]);
    updatedRow.model = { key: originalRow.model.key, name: 'new name value' };
    updatedRow.syncAction = SyncAction.updated;

    state.setDataState = jest.fn().mockImplementation((newState: IDataState<IData>) =>
    {
        expect(newState.data.length).toBe(pageSize);
        expect(newState.totalCount).toBe(totalData);
        expect(newState.data[index].rowNumber).toBe(originalRow.rowNumber);
        expect(newState.data[index].rowId).toBe(originalRow.rowId);
        expect(newState.data[index].showDetail).toBe(originalRow.showDetail);
        expect(newState.data[index].model).not.toBeNull();
        expect(newState.data[index].model.key).toBe(originalRow.model.key);
        expect(newState.data[index].model.name).toBe(updatedRow.model.name);
        expect(newState.data[index].syncAction).toBe(SyncAction.updated);
    });

    updateRow(updatedRow.rowId, updatedRow.model, state, props);

    expect(state.setDataState).toHaveBeenCalledTimes(1);
    expect(state.setNeedsSave).toHaveBeenLastCalledWith(true);
    expect(state.setSaveRequested).toHaveBeenCalledTimes(0);
});


it('update row: autosave=true', () =>
{
    const props = getDefaultProps();
    const state = getDefaultState();
    if (!props || !state || !props.editable)
    {
        throw new Error('props or state null');
    }
    props.editable.autoSave = true;

    const index = 3;
    const originalRow = cloneData(state.dataState.data[index]);
    const updatedRow = cloneData(state.dataState.data[index]);
    updatedRow.model = { key: originalRow.model.key, name: 'new name value' };
    updatedRow.syncAction = SyncAction.updated;

    state.setDataState = jest.fn().mockImplementation((newState: IDataState<IData>) =>
    {
        expect(newState.data.length).toBe(pageSize);
        expect(newState.totalCount).toBe(totalData);
        expect(newState.data[index].rowNumber).toBe(originalRow.rowNumber);
        expect(newState.data[index].rowId).toBe(originalRow.rowId);
        expect(newState.data[index].showDetail).toBe(originalRow.showDetail);
        expect(newState.data[index].model).not.toBeNull();
        expect(newState.data[index].model.key).toBe(originalRow.model.key);
        expect(newState.data[index].model.name).toBe(updatedRow.model.name);
        expect(newState.data[index].syncAction).toBe(SyncAction.updated);
    });

    updateRow(updatedRow.rowId, updatedRow.model, state, props);

    expect(state.setDataState).toHaveBeenCalledTimes(1);
    expect(state.setNeedsSave).toHaveBeenLastCalledWith(true);
    expect(state.setSaveRequested).toHaveBeenLastCalledWith(true);
});

it('delete row: autosave=false', () =>
{
    const props = getDefaultProps();
    const state = getDefaultState();
    if (!props || !state || !props.editable)
    {
        throw new Error('props or state null');
    }
    props.editable.autoSave = false;

    const index = 3;
    const originalRow = cloneData(state.dataState.data[index]);
    const deletedRow = cloneData(state.dataState.data[index]);

    state.setDataState = jest.fn().mockImplementation((newState: IDataState<IData>) =>
    {
        expect(newState.data.length).toBe(pageSize);
        expect(newState.totalCount).toBe(totalData);
        expect(newState.data[index].rowNumber).toBe(-1);
        expect(newState.data[index].rowId).toBe(originalRow.rowId);
        expect(newState.data[index].showDetail).toBe(originalRow.showDetail);
        expect(newState.data[index].model).not.toBeNull();
        expect(newState.data[index].model.key).toBe(originalRow.model.key);
        expect(newState.data[index].model.name).toBe(deletedRow.model.name);
        expect(newState.data[index].syncAction).toBe(SyncAction.deleted);
    });

    deleteRow(deletedRow.rowId, state, props);

    expect(state.setDataState).toHaveBeenCalledTimes(1);
    expect(state.setNeedsSave).toHaveBeenLastCalledWith(true);
    expect(state.setSaveRequested).toHaveBeenCalledTimes(0);

    let currentRowNum = 1;
    for (let row of state.dataState.data)
    {
        const isDeletion = row.syncAction === SyncAction.deleted;
        const expectedRowNum = isDeletion ? -1 : currentRowNum;
        expect(row.rowNumber).toBe(expectedRowNum);
        if (!isDeletion)
        {
            currentRowNum++;
        }
    }
});

it('delete row: autosave=true', () =>
{
    const props = getDefaultProps();
    const state = getDefaultState();
    if (!props || !state || !props.editable)
    {
        throw new Error('props or state null');
    }
    props.editable.autoSave = true;

    const index = 3;
    const originalRow = cloneData(state.dataState.data[index]);
    const deletedRow = cloneData(state.dataState.data[index]);

    state.setDataState = jest.fn().mockImplementation((newState: IDataState<IData>) =>
    {
        expect(newState.data.length).toBe(pageSize);
        expect(newState.totalCount).toBe(totalData);
        expect(newState.data[index].rowNumber).toBe(-1);
        expect(newState.data[index].rowId).toBe(originalRow.rowId);
        expect(newState.data[index].showDetail).toBe(originalRow.showDetail);
        expect(newState.data[index].model).not.toBeNull();
        expect(newState.data[index].model.key).toBe(originalRow.model.key);
        expect(newState.data[index].model.name).toBe(deletedRow.model.name);
        expect(newState.data[index].syncAction).toBe(SyncAction.deleted);
    });

    deleteRow(deletedRow.rowId, state, props);

    expect(state.setDataState).toHaveBeenCalledTimes(1);
    expect(state.setNeedsSave).toHaveBeenLastCalledWith(true);
    expect(state.setSaveRequested).toHaveBeenLastCalledWith(true);

    let currentRowNum = 1;
    for (let row of state.dataState.data)
    {
        const isDeletion = row.syncAction === SyncAction.deleted;
        const expectedRowNum = isDeletion ? -1 : currentRowNum;
        expect(row.rowNumber).toBe(expectedRowNum);
        if (!isDeletion)
        {
            currentRowNum++;
        }
    }
});
