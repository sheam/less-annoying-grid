/* tslint:disable:no-magic-numbers max-line-length jsx-no-lambda no-empty */
import { shallow, ShallowWrapper } from 'enzyme';
import * as React from 'react';

import * as GridContext from '../../context';
import { Footer, IFooterProps } from '../footer';
import { GridEditMode } from '../../types-grid';
import { IPagination } from '../../types-pagination';
import { SyncAction } from "../../types-sync";

const getByTestId = (c: ShallowWrapper, name: string) =>
    c.find(`[data-test="${name}"]`);
const jumpButton = (c: ShallowWrapper, index: number) =>
    getByTestId(c, 'jump').at(index);
const jumpButtonValue = (c: ShallowWrapper, index: number) =>
    jumpButton(c, index).props().value;
const jumpButtonDisabled = (c: ShallowWrapper, index: number) =>
    jumpButton(c, index).props().disabled;
function setGridContextData(gridContext: GridContext.IGridContext<any>): void
{
    if (!gridContext.setPagination)
    {
        gridContext.setPagination = jest.fn(); // default implementation
    }
    jest.spyOn(GridContext, 'useGridContext').mockImplementation(
        () => gridContext
    );
}

it('renders a footer with pagination data', () =>
{
    const pagination: IPagination = {
        currentPage: 1,
        pageSize: 10,
    };
    setGridContextData({ pagination });

    const totalCount = 50;
    const numColumns = 4;
    const component = shallow(
        <Footer totalCount={totalCount} numColumns={numColumns} />
    );

    expect(component.find('tfoot')).toHaveLength(1);
    expect(getByTestId(component, 'next-button')).toHaveLength(1);
    expect(getByTestId(component, 'prev-button')).toHaveLength(1);
    expect(getByTestId(component, 'total-label').text()).toContain(totalCount);
    expect(getByTestId(component, 'page-size-select').props().value).toBe(
        pagination.pageSize
    );
    expect(getByTestId(component, 'jump')).toHaveLength(5);
    expect(jumpButtonValue(component, 0)).toBe(1);
    expect(jumpButtonDisabled(component, 0)).toBeTruthy();
    expect(jumpButtonValue(component, 1)).toBe(2);
    expect(jumpButtonDisabled(component, 1)).toBeFalsy();
    expect(jumpButtonValue(component, 2)).toBe(3);
    expect(jumpButtonValue(component, 3)).toBe(4);
    expect(jumpButtonValue(component, 4)).toBe(5);
});

it('renders correct number of pages', () =>
{
    const pagination: IPagination = {
        currentPage: 1,
        pageSize: 5,
    };
    setGridContextData({ pagination });
    const totalCount = 100;
    const numColumns = 4;
    const component = shallow(
        <Footer totalCount={totalCount} numColumns={numColumns} />
    );

    expect(getByTestId(component, 'jump')).toHaveLength(7);
    expect(jumpButtonValue(component, 6)).toBe(20);
});

it('renders a footer with big jump to end', () =>
{
    const pagination: IPagination = {
        currentPage: 1,
        pageSize: 10,
    };
    setGridContextData({ pagination });
    const totalCount = 100;
    const numColumns = 4;
    const component = shallow(
        <Footer totalCount={totalCount} numColumns={numColumns} />
    );

    expect(getByTestId(component, 'jump')).toHaveLength(7);
    expect(jumpButtonValue(component, 0)).toBe(1);
    expect(jumpButtonDisabled(component, 0)).toBeTruthy();
    expect(jumpButtonValue(component, 1)).toBe(2);
    expect(jumpButtonValue(component, 2)).toBe(3);
    expect(jumpButtonValue(component, 3)).toBe(4);
    expect(jumpButtonValue(component, 4)).toBe(5);
    expect(jumpButtonValue(component, 5)).toBe(6);
    expect(jumpButtonValue(component, 6)).toBe(10);
});

it('renders a footer with big jump to front', () =>
{
    const pagination: IPagination = {
        currentPage: 10,
        pageSize: 10,
    };
    setGridContextData({ pagination });
    const totalCount = 100;
    const numColumns = 4;
    const component = shallow(
        <Footer totalCount={totalCount} numColumns={numColumns} />
    );

    expect(getByTestId(component, 'jump')).toHaveLength(7);
    expect(jumpButtonValue(component, 0)).toBe(1);
    expect(jumpButtonValue(component, 1)).toBe(5);
    expect(jumpButtonValue(component, 2)).toBe(6);
    expect(jumpButtonValue(component, 3)).toBe(7);
    expect(jumpButtonValue(component, 4)).toBe(8);
    expect(jumpButtonValue(component, 5)).toBe(9);
    expect(jumpButtonValue(component, 6)).toBe(10);
    expect(jumpButtonDisabled(component, 6)).toBeTruthy();
});

it('next advances 1 page', () =>
{
    const pagination: IPagination = {
        currentPage: 1,
        pageSize: 10,
    };

    const totalCount = 100;
    const numColumns = 4;

    const setPaginationMock = jest.fn();
    setGridContextData({ pagination, setPagination: setPaginationMock });

    const component = shallow(
        <Footer totalCount={totalCount} numColumns={numColumns} />
    );

    getByTestId(component, 'next-button').simulate('click');
    expect(setPaginationMock).toHaveBeenCalledWith({
        pageSize: pagination.pageSize,
        currentPage: pagination.currentPage + 1,
    });
});

it('next does not advance past the end', () =>
{
    const pagination: IPagination = {
        currentPage: 10,
        pageSize: 10,
    };
    const totalCount = 100;
    const numColumns = 4;

    const setPaginationMock = jest.fn();
    setGridContextData({ pagination, setPagination: setPaginationMock });

    const component = shallow(
        <Footer totalCount={totalCount} numColumns={numColumns} />
    );

    getByTestId(component, 'next-button').simulate('click');
    expect(setPaginationMock).toHaveBeenCalledWith({
        pageSize: pagination.pageSize,
        currentPage: pagination.currentPage,
    });
});

it('prev goes 1 page back', () =>
{
    const pagination: IPagination = {
        currentPage: 5,
        pageSize: 10,
    };
    const totalCount = 100;
    const numColumns = 4;

    const setPaginationMock = jest.fn();
    setGridContextData({ pagination, setPagination: setPaginationMock });

    const component = shallow(
        <Footer totalCount={totalCount} numColumns={numColumns} />
    );

    getByTestId(component, 'prev-button').simulate('click');
    expect(setPaginationMock).toHaveBeenCalledWith({
        pageSize: pagination.pageSize,
        currentPage: pagination.currentPage - 1,
    });
});

it('prev does not go back past 1', () =>
{
    const pagination: IPagination = {
        currentPage: 1,
        pageSize: 10,
    };
    const totalCount = 100;
    const numColumns = 4;

    const setPaginationMock = jest.fn();
    setGridContextData({ pagination, setPagination: setPaginationMock });

    const component = shallow(
        <Footer totalCount={totalCount} numColumns={numColumns} />
    );

    getByTestId(component, 'prev-button').simulate('click');
    expect(setPaginationMock).toHaveBeenCalledWith({
        pageSize: pagination.pageSize,
        currentPage: pagination.currentPage,
    });
});

it('page size options', () =>
{
    const pagination: IPagination = {
        currentPage: 1,
        pageSize: 10,
    };
    setGridContextData({ pagination });
    const config: IFooterProps = {
        pageSizeOptions: [5, 10, 100, 1000], //should not render the 1000 because it doesn't make sense
    };
    const totalCount = 100;
    const numColumns = 4;

    const setPaginationMock = jest.fn();
    setGridContextData({ pagination, setPagination: setPaginationMock });

    const component = shallow(
        <Footer
            totalCount={totalCount}
            numColumns={numColumns}
            config={config}
        />
    );

    expect(
        getByTestId(component, 'page-size-select').find('option')
    ).toHaveLength(3);

    if (!config.pageSizeOptions)
    {
        throw new Error('pageSizeOptions not configured properly for test');
    }
    expect(
        getByTestId(component, 'page-size-select').find('option').at(0).props()
            .value
    ).toBe(config.pageSizeOptions[0]);
    expect(
        getByTestId(component, 'page-size-select').find('option').at(1).props()
            .value
    ).toBe(config.pageSizeOptions[1]);
    expect(
        getByTestId(component, 'page-size-select').find('option').at(2).props()
            .value
    ).toBe(config.pageSizeOptions[2]);
});

it('changing page size', () =>
{
    const pagination: IPagination = {
        currentPage: 1,
        pageSize: 10,
    };
    const config: IFooterProps = {
        pageSizeOptions: [5, 10, 100, 1000], //should not render the 1000 because it doesn't make sense
    };
    const totalCount = 100;
    const numColumns = 4;

    const setPaginationMock = jest.fn();
    setGridContextData({ pagination, setPagination: setPaginationMock });

    const component = shallow(
        <Footer
            totalCount={totalCount}
            numColumns={numColumns}
            config={config}
        />
    );

    expect(getByTestId(component, 'page-size-select')).toHaveLength(1);
    getByTestId(component, 'page-size-select').simulate('change', {
        target: { value: 5 },
    });
    expect(setPaginationMock).toHaveBeenCalledWith({
        currentPage: 1,
        pageSize: 5,
    });
});

it('disabled when needs saving', () =>
{
    const pagination: IPagination = {
        currentPage: 1,
        pageSize: 10,
    };
    const config: IFooterProps = {
        pageSizeOptions: [5, 10, 100], //should not render the 1000 because it doesn't make sense
    };
    const totalCount = 100;
    const numColumns = 4;

    const setPaginationMock = jest.fn();
    setGridContextData({
        pagination,
        setPagination: setPaginationMock,
        editingContext: {
            needsSave: true,
            syncProgress: null,
            setEditField: jest.fn(),
            updateRow: jest.fn(),
            editMode: GridEditMode.inline,
            editField: null,
            autoSave: false,
            sync: jest.fn(),
            deleteRow: jest.fn(),
            addRow: jest.fn(),
            validationErrors: false,
            revertRow: jest.fn(),
            revertAll: jest.fn(),
            modelTypeName: 'MyObject',
            modelEditor: undefined,
            advanceEditField: jest.fn(),
        },
    });

    const component = shallow(
        <Footer
            totalCount={totalCount}
            numColumns={numColumns}
            config={config}
        />
    );

    expect(getByTestId(component, 'next-button').prop('disabled')).toBeTruthy();
    expect(getByTestId(component, 'prev-button').prop('disabled')).toBeTruthy();
    expect(
        getByTestId(component, 'page-size-select').prop('disabled')
    ).toBeTruthy();

    const jumps = getByTestId(component, 'jump');
    for (let i = 0; i < jumps.length; i++)
    {
        expect(jumps.at(0).prop('disabled')).toBeTruthy();
    }
});

it('disabled when needs editing', () =>
{
    const pagination: IPagination = {
        currentPage: 1,
        pageSize: 10,
    };
    const config: IFooterProps = {
        pageSizeOptions: [5, 10, 100], //should not render the 1000 because it doesn't make sense
    };
    const totalCount = 100;
    const numColumns = 4;

    const setPaginationMock = jest.fn();
    setGridContextData({
        pagination,
        setPagination: setPaginationMock,
        editingContext: {
            needsSave: false,
            syncProgress: null,
            updateRow: jest.fn(),
            editField: { rowData: { rowNumber: 1, syncAction: SyncAction.updated, rowId: '1', showDetail: false, model: {}, originalModel: {} }, field: 'one' },
            setEditField: jest.fn(),
            editMode: GridEditMode.inline,
            autoSave: false,
            sync: jest.fn(),
            deleteRow: jest.fn(),
            addRow: jest.fn(),
            validationErrors: false,
            revertAll: jest.fn(),
            revertRow: jest.fn(),
            modelTypeName: 'MyObject',
            modelEditor: undefined,
            advanceEditField: jest.fn(),
        },
    });

    const component = shallow(
        <Footer
            totalCount={totalCount}
            numColumns={numColumns}
            config={config}
        />
    );

    expect(getByTestId(component, 'next-button').prop('disabled')).toBeTruthy();
    expect(getByTestId(component, 'prev-button').prop('disabled')).toBeTruthy();
    expect(
        getByTestId(component, 'page-size-select').prop('disabled')
    ).toBeTruthy();

    const jumps = getByTestId(component, 'jump');
    for (let i = 0; i < jumps.length; i++)
    {
        expect(jumps.at(0).prop('disabled')).toBeTruthy();
    }
});
