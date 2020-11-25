// @ts-ignore
import { IRowData, ISyncDataResult, SyncAction } from '../types';
import { _applySyncResults, IGridState } from '../grid';

interface IData {
    key: number;
    firstName: string;
    lastName: string;
}

function getData(): IData[] {
    return [
        { key: 1, firstName: 'Shea', lastName: 'Martin' },
        { key: 2, firstName: 'Doug', lastName: 'Jones' },
        { key: 3, firstName: 'Jesse', lastName: 'Prendergast' },
        { key: 4, firstName: 'Violet', lastName: 'Wallflower' },
    ];
}

function getDetaultState(): IGridState {
    const data = getData();
    const rowData: Array<IRowData> = data.map((m, i) => {
        return {
            model: m,
            syncAction: SyncAction.updated,
            rowNumber: i + 1,
            uid: '123',
        };
    });
    return {
        pagination: null,
        setPagination: jest.fn(),
        isEditing: false,
        setIsEditing: jest.fn(),
        dataState: { totalCount: rowData.length, data: rowData },
        setDataState: jest.fn(),
        sort: null,
        setSort: jest.fn(),
        filters: [],
        setFilters: jest.fn(),
        editField: null,
        setEditField: jest.fn(),
        syncProgress: null,
        setSyncProgress: jest.fn(),
        needsSave: true,
        setNeedsSave: jest.fn(),
        isLoading: false,
        setIsLoading: jest.fn(),
        saveRequested: false,
        setSaveRequested: jest.fn(),
    };
}

it('applies updates', () => {
    const state = getDetaultState();
    const results: Array<ISyncDataResult<IData>> = state.dataState.data.map(
        (r: IRowData) => {
            return {
                rowNumber: r.rowNumber,
                model: r.model,
                syncAction: r.syncAction,
                success: true,
            };
        }
    );
    _applySyncResults(
        state,
        { current: results.length, total: results.length },
        results
    );

    expect(state.dataState.data[0].syncAction).toBe(SyncAction.unchanged);
    expect(state.dataState.data[1].syncAction).toBe(SyncAction.unchanged);
    expect(state.dataState.data[2].syncAction).toBe(SyncAction.unchanged);
    expect(state.dataState.data[3].syncAction).toBe(SyncAction.unchanged);
});

it('applies adds', () => {
    const state = getDetaultState();
    state.dataState.data[0].syncAction = SyncAction.added;
    state.dataState.data[1].syncAction = SyncAction.added;

    const results: Array<ISyncDataResult<IData>> = state.dataState.data.map(
        (r: IRowData) => {
            return {
                rowNumber: r.rowNumber,
                model: r.model,
                syncAction: r.syncAction,
                success: true,
            };
        }
    );
    _applySyncResults(
        state,
        { current: results.length, total: results.length },
        results
    );

    expect(state.dataState.data[0].syncAction).toBe(SyncAction.unchanged);
    expect(state.dataState.data[1].syncAction).toBe(SyncAction.unchanged);
    expect(state.dataState.data[2].syncAction).toBe(SyncAction.unchanged);
    expect(state.dataState.data[3].syncAction).toBe(SyncAction.unchanged);
});

it('applies delete', () => {
    const state = getDetaultState();
    const deletedKey = state.dataState.data[1].model.key;
    state.dataState.data[1].syncAction = SyncAction.deleted;

    const results: Array<ISyncDataResult<IData>> = state.dataState.data.map(
        (r: IRowData) => {
            return {
                rowNumber: r.rowNumber,
                model: r.model,
                syncAction: r.syncAction,
                success: true,
            };
        }
    );
    _applySyncResults(
        state,
        { current: results.length, total: results.length },
        results
    );

    expect(state.dataState.data.length).toBe(3);
    expect(state.dataState.data[0].syncAction).toBe(SyncAction.unchanged);
    expect(state.dataState.data[1].syncAction).toBe(SyncAction.unchanged);
    expect(state.dataState.data[2].syncAction).toBe(SyncAction.unchanged);
    expect(
        state.dataState.data.find(x => x.model.key === deletedKey)
    ).toBeFalsy();
});
