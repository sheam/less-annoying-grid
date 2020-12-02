import { IDataState, IRowData } from "../types-grid";
import { IGridState } from "../state";
import { revertRows } from "../editing";
import * as mock from './mock-data'
import { getData } from './mock-data'
import { SyncAction } from "../types-sync";
import { cloneData, deepEqual, shallowClone } from "../util";

interface IData
{
    key: number;
    name: string;
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

function validateAllReverted(newState: IDataState<IData>, ignoreId?: string)
{
    expect(newState.data.length).toBe(pageSize);
    expect(newState.totalCount).toBe(totalData);

    let expectedRowNum = 1;
    for (let row of newState.data)
    {
        if (ignoreId && row.rowId === ignoreId)
        {
            expectedRowNum++
            continue;
        }

        // @ts-ignore
        expect(row.validationErrors).toBeFalsy();
        expect(row.syncAction).toBe(SyncAction.unchanged);
        expect(row.rowNumber).toBe(expectedRowNum++);
        expect(row.rowId?.length).toBeGreaterThan(0);
    }
}

it('revert all update', () =>
{
    const state = getDefaultState();


    const targetRow = state.dataState.data[3];
    const originalRow = cloneData(targetRow);
    targetRow.syncAction = SyncAction.updated;
    targetRow.model.name = `${targetRow.syncAction} name`;

    state.setDataState = jest.fn().mockImplementation((newState: IDataState<IData>) =>
    {
        const row = newState.data.find(r => r.rowId === targetRow.rowId);
        expect(deepEqual(row, originalRow)).toBeTruthy();
        validateAllReverted(newState);
    });

    revertRows(state.dataState.data.map(r => r.rowId), state);

    expect(state.setDataState).toHaveBeenCalledTimes(1);
    expect(state.setNeedsSave).toHaveBeenLastCalledWith(false);
    expect(state.setValidationErrors).toHaveBeenLastCalledWith(false);
});

it('revert update 1', () =>
{
    const state = getDefaultState();


    const targetRow = state.dataState.data[3];
    const originalRow = cloneData(targetRow);
    targetRow.syncAction = SyncAction.updated;
    targetRow.model.name = `${targetRow.syncAction} name`;

    const otherChange = state.dataState.data[6];
    otherChange.syncAction = SyncAction.updated;
    otherChange.model.name = `${otherChange.syncAction} other name`;

    state.setDataState = jest.fn().mockImplementation((newState: IDataState<IData>) =>
    {
        const row = newState.data.find(r => r.rowId === targetRow.rowId);
        expect(deepEqual(row, originalRow)).toBeTruthy();
        expect(deepEqual(otherChange.model, otherChange.originalModel)).toBe(false);
        validateAllReverted(newState, otherChange.rowId);
    });

    revertRows([targetRow.rowId], state);

    expect(state.setDataState).toHaveBeenCalledTimes(1);
    expect(state.setNeedsSave).toHaveBeenLastCalledWith(true);
    expect(state.setValidationErrors).toHaveBeenLastCalledWith(false);
});


it('revert all update - with validation errors', () =>
{
    const state = getDefaultState();


    const targetRow = state.dataState.data[3];
    const originalRow = cloneData(targetRow);
    targetRow.syncAction = SyncAction.updated;
    targetRow.model.name = `${targetRow.syncAction} name`;
    targetRow.validationErrors = [{ field: 'name', error: 'too funny' }];

    state.setDataState = jest.fn().mockImplementation((newState: IDataState<IData>) =>
    {
        const row = newState.data.find(r => r.rowId === targetRow.rowId);
        expect(deepEqual(row, originalRow)).toBeTruthy();
        validateAllReverted(newState);
    });

    revertRows(state.dataState.data.map(r => r.rowId), state);

    expect(state.setDataState).toHaveBeenCalledTimes(1);
    expect(state.setNeedsSave).toHaveBeenLastCalledWith(false);
    expect(state.setValidationErrors).toHaveBeenLastCalledWith(false);
});

it('revert all delete', () =>
{
    const state = getDefaultState();

    const targetRow = state.dataState.data[3];
    const originalRow = cloneData(targetRow);
    targetRow.syncAction = SyncAction.deleted;
    targetRow.rowNumber = -1;
    targetRow.model.name = `${targetRow.syncAction} name`;

    state.setDataState = jest.fn().mockImplementation((newState: IDataState<IData>) =>
    {
        const row = newState.data.find(r => r.rowId === targetRow.rowId);
        expect(deepEqual(row, originalRow)).toBeTruthy();
        expect(row?.rowNumber).toBeGreaterThan(0);
        validateAllReverted(newState);
    });

    revertRows(state.dataState.data.map(r => r.rowId), state);

    expect(state.setDataState).toHaveBeenCalledTimes(1);
    expect(state.setNeedsSave).toHaveBeenLastCalledWith(false);
    expect(state.setValidationErrors).toHaveBeenLastCalledWith(false);
});

it('revert delete 1', () =>
{
    const state = getDefaultState();

    const targetRow = state.dataState.data[3];
    const originalRow = cloneData(targetRow);
    targetRow.syncAction = SyncAction.deleted;
    targetRow.rowNumber = -1;
    targetRow.model.name = `${targetRow.syncAction} name`;

    const otherChange = state.dataState.data[6];
    otherChange.syncAction = SyncAction.updated;
    otherChange.model.name = `${otherChange.syncAction} other name`;

    state.setDataState = jest.fn().mockImplementation((newState: IDataState<IData>) =>
    {
        const row = newState.data.find(r => r.rowId === targetRow.rowId);
        expect(deepEqual(row, originalRow)).toBeTruthy();
        expect(deepEqual(otherChange.model, otherChange.originalModel)).toBe(false);
        validateAllReverted(newState, otherChange.rowId);
    });

    revertRows([targetRow.rowId], state);

    expect(state.setDataState).toHaveBeenCalledTimes(1);
    expect(state.setNeedsSave).toHaveBeenLastCalledWith(true);
    expect(state.setValidationErrors).toHaveBeenLastCalledWith(false);
});

it('revert all add', () =>
{
    const state = getDefaultState();

    const newModel: IData = {
        key: 0,
        name: 'new name',
    };

    const newRow: IRowData<IData> = {
        rowId: 'new-id',
        rowNumber: 1,
        syncAction: SyncAction.added,
        validationErrors: null,
        model: newModel,
        originalModel: cloneData(newModel),
        showDetail: false,
    };

    state.dataState.data.unshift(newRow);
    state.dataState.data.forEach((r, i) => r.rowNumber = i + 1);

    state.setDataState = jest.fn().mockImplementation((newState: IDataState<IData>) =>
    {
        const row = newState.data.find(r => r.rowId === newRow.rowId);
        expect(row).toBeFalsy();
        validateAllReverted(newState);
    });

    revertRows(state.dataState.data.map(r => r.rowId), state);

    expect(state.setDataState).toHaveBeenCalledTimes(1);
    expect(state.setNeedsSave).toHaveBeenLastCalledWith(false);
    expect(state.setValidationErrors).toHaveBeenLastCalledWith(false);
});

it('revert add 1', () =>
{
    const state = getDefaultState();

    const newModel: IData = {
        key: 0,
        name: 'new name',
    };

    const newRow: IRowData<IData> = {
        rowId: 'new-id',
        rowNumber: 1,
        syncAction: SyncAction.added,
        validationErrors: null,
        model: newModel,
        originalModel: cloneData(newModel),
        showDetail: false,
    };

    state.dataState.data.unshift(newRow);
    state.dataState.data.forEach((r, i) => r.rowNumber = i + 1);

    const otherChange = state.dataState.data[6];
    otherChange.syncAction = SyncAction.updated;
    otherChange.model.name = `${otherChange.syncAction} other name`;

    state.setDataState = jest.fn().mockImplementation((newState: IDataState<IData>) =>
    {
        const row = newState.data.find(r => r.rowId === newRow.rowId);
        expect(row).toBeFalsy();

        expect(deepEqual(otherChange.model, otherChange.originalModel)).toBe(false);
        validateAllReverted(newState, otherChange.rowId);
    });

    revertRows([newRow.rowId], state);

    expect(state.setDataState).toHaveBeenCalledTimes(1);
    expect(state.setNeedsSave).toHaveBeenLastCalledWith(true);
    expect(state.setValidationErrors).toHaveBeenLastCalledWith(false);
});
