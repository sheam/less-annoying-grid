/* tslint:disable:no-magic-numbers max-line-length jsx-no-lambda no-empty */
import { mount, ReactWrapper, ShallowWrapper } from 'enzyme';
import * as React from 'react';
import { GridEditMode, IRowData, SyncAction } from '../../types';
import * as GridContext from '../../context';
import { IGridContext } from '../../context';
import { cols, data } from './mock-data';
import { RowReadOnly } from '../row-readonly';
import { RowInlineEdit } from '../row-inline-edit';
import { cloneData } from '../../util';

const getByTestId = (c: ReactWrapper | ShallowWrapper, name: string) =>
    c.find(`[data-test="${name}"]`);
const getCellAt = (c: ReactWrapper | ShallowWrapper, index: number) =>
    c.find(`[data-test="data-row"]`).find('td').at(index);

function setGridContextData(gridContext: GridContext.IGridContext): void {
    if (!gridContext.setPagination) {
        gridContext.setPagination = jest.fn(); // default implementation
    }
    jest.spyOn(GridContext, 'useGridContext').mockImplementation(
        () => gridContext
    );
}

it('renders a rows of readonly data', async () => {
    const model = data[0];
    const rowData: IRowData = {
        rowId: 1,
        model,
        syncAction: SyncAction.unchanged,
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
    const gridContext: IGridContext = {
        editingContext: {
            isEditing: false,
            needsSave: false,
            syncProgress: null,
            editField: null,
            setEditField: jest.fn(),
            updateRow: jest.fn(),
            editMode: GridEditMode.inline,
            autoSave: false,
        },
    };
    setGridContextData(gridContext);

    const model = data[0];
    const rowData: IRowData = {
        rowId: 1,
        model,
        syncAction: SyncAction.unchanged,
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
    const gridContext: IGridContext = {
        editingContext: {
            isEditing: false,
            needsSave: false,
            syncProgress: null,
            editField: null,
            setEditField: jest.fn(),
            updateRow: jest.fn(),
            editMode: GridEditMode.inline,
            autoSave: false,
        },
    };
    setGridContextData(gridContext);

    const model = data[0];
    const rowData: IRowData = {
        rowId: 1,
        model,
        syncAction: SyncAction.unchanged,
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
    const gridContext: IGridContext = {
        editingContext: {
            isEditing: false,
            needsSave: false,
            syncProgress: null,
            editField: null,
            setEditField: jest.fn(),
            updateRow: jest.fn(),
            editMode: GridEditMode.inline,
            autoSave: false,
        },
    };
    setGridContextData(gridContext);

    const model = data[0];
    const rowData: IRowData = {
        rowId: 1,
        model,
        syncAction: SyncAction.unchanged,
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
    const gridContext: IGridContext = {
        editingContext: {
            isEditing: false,
            needsSave: false,
            syncProgress: null,
            editField: null,
            setEditField: jest.fn(),
            updateRow: jest.fn(),
            editMode: GridEditMode.inline,
            autoSave: false,
        },
    };
    setGridContextData(gridContext);

    const model = data[0];
    const rowData: IRowData = {
        rowId: 1,
        model,
        syncAction: SyncAction.unchanged,
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
    const gridContext: IGridContext = {
        editingContext: {
            isEditing: false,
            needsSave: false,
            syncProgress: null,
            editField: null,
            setEditField: jest.fn(),
            updateRow: jest.fn(),
            editMode: GridEditMode.inline,
            autoSave: false,
        },
    };
    setGridContextData(gridContext);

    const model = data[0];
    const rowData: IRowData = {
        rowId: 1,
        model,
        syncAction: SyncAction.unchanged,
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
