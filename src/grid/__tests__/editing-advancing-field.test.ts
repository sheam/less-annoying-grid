import { Direction, GridEditMode, IEditField, IGridProps, IRowData } from "../types-grid";
import { IGridState } from "../state";
import { advanceEditField } from "../editing";
import * as mock from './mock-data'
import { getData, IData, IDataDetailed } from './mock-data';
import { SyncAction } from "../types-sync";
import { shallowClone } from "../util";

function getDefaultProps(): IGridProps<IData, IDataDetailed, IDataDetailed>
{
    return {
        columns: [
            {
                type: 'data',
                field: 'key',
                name: 'Key'
            },
            {//must be first editable col
                type: 'data',
                field: 'name',
                name: 'Name',
                editable: { type: 'text' },
            },
            {
                type: 'data',
                field: 'age',
                name: 'Age',
                editable: { type: 'number' },
            },
            {//must be last editable col
                type: 'data',
                field: 'eyeColor',
                name: 'Eyes',
                editable: { type: 'text' },
            },
        ],
        getDataAsync: jest.fn(),
        editable: {
            editMode: GridEditMode.inline,
            autoSave: false,
            syncChanges: jest.fn(),
            modelTypeName: 'MyObject',
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

const totalData = 10;

beforeEach(() => mock.resetData(totalData));

it('next field on same row', () =>
{
    const props = getDefaultProps();
    const state = getDefaultState();
    if (!props || !state || !props.editable)
    {
        throw new Error('props or state null');
    }

    const currentEditRow = state.dataState.data[3];

    state.editField = { field: 'name', rowData: currentEditRow };

    state.setEditField = jest.fn().mockImplementation((editField: IEditField<IData> | null) =>
    {
        expect(editField).not.toBeFalsy();
        expect(editField?.field).toBe('age');
        expect(editField?.rowData.rowId).toBe(currentEditRow.rowId);
    });

    advanceEditField(state, props.columns, Direction.forward);

    expect(state.setEditField).toHaveBeenCalledTimes(1);
});

it('previous field on same row', () =>
{
    const props = getDefaultProps();
    const state = getDefaultState();
    if (!props || !state || !props.editable)
    {
        throw new Error('props or state null');
    }

    const currentEditRow = state.dataState.data[3];

    state.editField = { field: 'age', rowData: currentEditRow };

    state.setEditField = jest.fn().mockImplementation((editField: IEditField<IData> | null) =>
    {
        expect(editField).not.toBeFalsy();
        expect(editField?.field).toBe('name');
        expect(editField?.rowData.rowId).toBe(currentEditRow.rowId);
    });

    advanceEditField(state, props.columns, Direction.backward);

    expect(state.setEditField).toHaveBeenCalledTimes(1);
});

it('last field of row to first of next', () =>
{
    const props = getDefaultProps();
    const state = getDefaultState();
    if (!props || !state || !props.editable)
    {
        throw new Error('props or state null');
    }

    const currentEditRow = state.dataState.data[3];
    const nextRow = state.dataState.data[4];

    state.editField = { field: 'eyeColor', rowData: currentEditRow };

    state.setEditField = jest.fn().mockImplementation((editField: IEditField<IData> | null) =>
    {
        expect(editField).not.toBeFalsy();
        expect(editField?.field).toBe('name');
        expect(editField?.rowData.rowId).toBe(nextRow.rowId);
    });

    advanceEditField(state, props.columns, Direction.forward);

    expect(state.setEditField).toHaveBeenCalledTimes(1);
});

it('first field of row to last of previous', () =>
{
    const props = getDefaultProps();
    const state = getDefaultState();
    if (!props || !state || !props.editable)
    {
        throw new Error('props or state null');
    }

    const currentEditRow = state.dataState.data[3];
    const prevRow = state.dataState.data[2];

    state.editField = { field: 'name', rowData: currentEditRow };

    state.setEditField = jest.fn().mockImplementation((editField: IEditField<IData> | null) =>
    {
        expect(editField).not.toBeFalsy();
        expect(editField?.field).toBe('eyeColor');
        expect(editField?.rowData.rowId).toBe(prevRow.rowId);
    });

    advanceEditField(state, props.columns, Direction.backward);

    expect(state.setEditField).toHaveBeenCalledTimes(1);
});
