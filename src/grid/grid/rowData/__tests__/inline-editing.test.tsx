/* tslint:disable:no-magic-numbers max-line-length jsx-no-lambda no-empty */
import { mount, ReactWrapper, ShallowWrapper } from 'enzyme';
import * as React from 'react';
import * as GridContext from '../../context';
import { RowReadOnly } from '../row-readonly';
import { RowInlineEdit } from '../row-inline-edit';
import { cloneData } from '../../util';
import { GridEditMode, IRowData } from '../../types-grid';
import { IGridContext } from '../../context';
import { Column } from '../../..';
import { SyncAction } from '../../types-sync';

const getByTestId = (c: ReactWrapper | ShallowWrapper, name: string) =>
    c.find(`[data-test="${name}"]`);
const getCellAt = (c: ReactWrapper | ShallowWrapper, index: number) =>
    c.find(`[data-test="data-row"]`).find('td').at(index);

function setGridContextData(
    gridContext: GridContext.IGridContext<IData>
): void {
    if (!gridContext.setPagination) {
        gridContext.setPagination = jest.fn(); // default implementation
    }
    jest.spyOn(GridContext, 'useGridContext').mockImplementation(
        () => gridContext as any
    );
}

it('renders a rows of readonly data', async () => {
    const model = data[0];
    const rowData: IRowData<IData> = {
        rowNumber: 1,
        rowId: `uid-1`,
        model,
        syncAction: SyncAction.unchanged,
        showDetail: false,
    };
    const c = mount(
        <table>
            <tbody>
                <RowReadOnly data={rowData} columns={cols} />
            </tbody>
        </table>
    ).update();

    expect(getByTestId(c, 'data-row')).toHaveLength(1);
    expect(getByTestId(c, 'data-row').find('td')).toHaveLength(cols.length);
    expect(getCellAt(c, 0).text()).toContain('1');
    expect(getCellAt(c, 1).text()).toContain('one');
    expect(getCellAt(c, 2).text()).toContain('a');
});

it('renders a rows of inline edit data', async () => {
    const gridContext: IGridContext<IData> = {
        editingContext: {
            isEditing: false,
            needsSave: false,
            syncProgress: null,
            editField: null,
            setEditField: jest.fn(),
            updateRow: jest.fn(),
            editMode: GridEditMode.inline,
            autoSave: false,
            sync: jest.fn(),
            deleteRow: jest.fn(),
            addRow: jest.fn(),
            validationErrors: false,
        },
    };
    setGridContextData(gridContext);

    const model = data[0];
    const rowData: IRowData<IData> = {
        rowNumber: 1,
        rowId: `uid-1`,
        model,
        syncAction: SyncAction.unchanged,
        showDetail: false,
    };
    const c = mount(
        <table>
            <tbody>
                <RowInlineEdit data={rowData} columns={cols} />
            </tbody>
        </table>
    ).update();

    expect(getByTestId(c, 'data-row')).toHaveLength(1);
    expect(getByTestId(c, 'data-row').find('td')).toHaveLength(cols.length);
    expect(getCellAt(c, 0).text()).toContain('1');
    expect(getCellAt(c, 1).text()).toContain('one');
    expect(getCellAt(c, 2).text()).toContain('a');
});

it('renders an editor in number col', async () => {
    const gridContext: IGridContext<IData> = {
        editingContext: {
            isEditing: false,
            needsSave: false,
            syncProgress: null,
            editField: null,
            setEditField: jest.fn(),
            updateRow: jest.fn(),
            editMode: GridEditMode.inline,
            autoSave: false,
            sync: jest.fn(),
            deleteRow: jest.fn(),
            addRow: jest.fn(),
            validationErrors: false,
        },
    };
    setGridContextData(gridContext);

    const model = data[0];
    const rowData: IRowData<IData> = {
        rowNumber: 1,
        rowId: `uid-1`,
        model,
        syncAction: SyncAction.unchanged,
        showDetail: false,
    };
    const colsWithEdit = cloneData(cols);
    const editCol = colsWithEdit[0];
    if (
        editCol.type === 'data' &&
        gridContext.editingContext &&
        editCol.field
    ) {
        editCol.editable = {
            type: 'number',
        };

        gridContext.editingContext.editField = {
            field: editCol.field,
            rowId: rowData.rowId,
        };
    }
    const c = mount(
        <table>
            <tbody>
                <RowInlineEdit data={rowData} columns={colsWithEdit} />
            </tbody>
        </table>
    ).update();

    expect(getByTestId(c, 'data-row')).toHaveLength(1);
    expect(getByTestId(c, 'data-row').find('td')).toHaveLength(cols.length);

    const cell = getCellAt(c, 0);
    expect(cell.find('input')).toHaveLength(1);
    expect(cell.find('input').prop('type')).toBe('number');
});

it('renders an editor in text col', async () => {
    const gridContext: IGridContext<IData> = {
        editingContext: {
            isEditing: false,
            needsSave: false,
            syncProgress: null,
            editField: null,
            setEditField: jest.fn(),
            updateRow: jest.fn(),
            editMode: GridEditMode.inline,
            autoSave: false,
            sync: jest.fn(),
            deleteRow: jest.fn(),
            addRow: jest.fn(),
            validationErrors: false,
        },
    };
    setGridContextData(gridContext);

    const model = data[0];
    const rowData: IRowData<IData> = {
        rowNumber: 1,
        rowId: `uid-1`,
        model,
        syncAction: SyncAction.unchanged,
        showDetail: false,
    };
    const colsWithEdit = cloneData(cols);
    const editCol = colsWithEdit[1];
    if (
        editCol.type === 'data' &&
        gridContext.editingContext &&
        editCol.field
    ) {
        editCol.editable = {
            type: 'text',
        };

        gridContext.editingContext.editField = {
            field: editCol.field,
            rowId: rowData.rowId,
        };
    }
    const c = mount(
        <table>
            <tbody>
                <RowInlineEdit data={rowData} columns={colsWithEdit} />
            </tbody>
        </table>
    ).update();

    expect(getByTestId(c, 'data-row')).toHaveLength(1);
    expect(getByTestId(c, 'data-row').find('td')).toHaveLength(cols.length);

    const cell = getCellAt(c, 1);
    expect(cell.find('input')).toHaveLength(1);
    expect(cell.find('input').prop('type')).toBe('text');
});

it('renders an editor in date col', async () => {
    const gridContext: IGridContext<IData> = {
        editingContext: {
            isEditing: false,
            needsSave: false,
            syncProgress: null,
            editField: null,
            setEditField: jest.fn(),
            updateRow: jest.fn(),
            editMode: GridEditMode.inline,
            autoSave: false,
            sync: jest.fn(),
            deleteRow: jest.fn(),
            addRow: jest.fn(),
            validationErrors: false,
        },
    };
    setGridContextData(gridContext);

    const model = data[0];
    const rowData: IRowData<IData> = {
        rowNumber: 1,
        rowId: `uid-1`,
        model,
        syncAction: SyncAction.unchanged,
        showDetail: false,
    };
    const colsWithEdit = cloneData(cols);
    const editCol = colsWithEdit[3];
    if (
        editCol.type === 'data' &&
        gridContext.editingContext &&
        editCol.field
    ) {
        editCol.editable = {
            type: 'date',
        };

        gridContext.editingContext.editField = {
            field: editCol.field,
            rowId: rowData.rowId,
        };
    }
    const c = mount(
        <table>
            <tbody>
                <RowInlineEdit data={rowData} columns={colsWithEdit} />
            </tbody>
        </table>
    ).update();

    expect(getByTestId(c, 'data-row')).toHaveLength(1);
    expect(getByTestId(c, 'data-row').find('td')).toHaveLength(cols.length);

    const cell = getCellAt(c, 3);
    expect(cell.find('input')).toHaveLength(1);
    expect(cell.find('input').prop('type')).toBe('date');
});

it('renders an editor with drop down values', async () => {
    const gridContext: IGridContext<IData> = {
        editingContext: {
            isEditing: false,
            needsSave: false,
            syncProgress: null,
            editField: null,
            setEditField: jest.fn(),
            updateRow: jest.fn(),
            editMode: GridEditMode.inline,
            autoSave: false,
            sync: jest.fn(),
            deleteRow: jest.fn(),
            addRow: jest.fn(),
            validationErrors: false,
        },
    };
    setGridContextData(gridContext);

    const model = data[0];
    const rowData: IRowData<IData> = {
        rowNumber: 1,
        rowId: `uid-1`,
        model,
        syncAction: SyncAction.unchanged,
        showDetail: false,
    };
    const colsWithEdit = cloneData(cols);
    const editCol = colsWithEdit[3];
    if (
        editCol.type === 'data' &&
        gridContext.editingContext &&
        editCol.field
    ) {
        editCol.editable = {
            type: 'values',
            subType: 'text',
            values: [
                { text: 'a', value: 'a' },
                { text: 'b', value: 'b' },
                { text: 'c', value: 'c' },
                { text: 'd', value: 'd' },
            ],
        };

        gridContext.editingContext.editField = {
            field: editCol.field,
            rowId: rowData.rowId,
        };
    }
    const c = mount(
        <table>
            <tbody>
                <RowInlineEdit data={rowData} columns={colsWithEdit} />
            </tbody>
        </table>
    ).update();

    expect(getByTestId(c, 'data-row')).toHaveLength(1);
    expect(getByTestId(c, 'data-row').find('td')).toHaveLength(cols.length);

    const cell = getCellAt(c, 3);
    expect(cell.find('select')).toHaveLength(1);
    expect(cell.find('option')).toHaveLength(4);
});

interface IData {
    numVal: number;
    textVal: string;
    enumVal: string;
    birthday: Date;
}

const cols: Array<Column<IData>> = [
    {
        type: 'data',
        name: 'Number',
        field: 'numVal',
    },
    {
        type: 'data',
        name: 'Text',
        field: 'textVal',
    },
    {
        type: 'data',
        name: 'Enum',
        field: 'enumVal',
    },
    {
        type: 'data',
        name: 'Birthday',
        field: 'birthday',
    },
];

const data: IData[] = [
    {
        numVal: 1,
        textVal: 'one',
        enumVal: 'a',
        birthday: new Date('2020-01-01'),
    },
    {
        numVal: 2,
        textVal: 'two',
        enumVal: 'b',
        birthday: new Date('2000-01-01'),
    },
    {
        numVal: 3,
        textVal: 'three',
        enumVal: 'c',
        birthday: new Date('1990-01-01'),
    },
    {
        numVal: 4,
        textVal: 'four',
        enumVal: 'd',
        birthday: new Date('1980-01-01'),
    },
];
