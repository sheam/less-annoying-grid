/* tslint:disable:no-magic-numbers max-line-length jsx-no-lambda no-empty */
import { shallow, ShallowWrapper } from 'enzyme';
import * as React from 'react';
import * as GridContext from '../../grid/context';
import { Header } from '../header';
import { Column, IColumn } from '../../columns/column-types';
import { ISortColumn } from '../../grid/types';

interface IDataRow {
    col1: string;
    col2: string;
    col3: string;
}

const getByTestId = (c: ShallowWrapper, name: string) =>
    c.find(`[data-test="${name}"]`);
const headerCell = (c: ShallowWrapper, index: number) =>
    getByTestId(c, 'header').at(index);
const groupCell = (c: ShallowWrapper, index: number) =>
    getByTestId(c, 'group').at(index);
function setGridContextData(gridContext: GridContext.IGridContext): void {
    jest.spyOn(GridContext, 'useGridContext').mockImplementation(
        () => gridContext
    );
}

it('renders simple header', () => {
    const cols: Array<Column<IDataRow>> = [
        {
            name: 'col 1',
            field: 'col1',
            type: 'data',
        },
        {
            name: 'col 2',
            field: 'col2',
            type: 'data',
        },
        {
            name: 'col 3',
            field: 'col3',
            type: 'data',
        },
    ];
    const c = shallow(<Header columns={cols} />);

    expect(headerCell(c, 0).text()).toContain(cols[0].name);
    expect(headerCell(c, 1).text()).toContain(cols[1].name);
    expect(headerCell(c, 2).text()).toContain(cols[2].name);
});

it('renders grouped header', () => {
    const cols: Array<Column<IDataRow>> = [
        {
            name: 'col 1',
            field: 'col1',
            type: 'data',
        },
        {
            name: 'group 2',
            type: 'group',
            subColumns: [
                {
                    name: 'col 2 - sub1',
                    field: 'sub1',
                    type: 'data',
                },
                {
                    name: 'col 2 - sub2',
                    field: 'sub2',
                    type: 'data',
                },
            ],
        },
        {
            name: 'col 3',
            field: 'col3',
            type: 'data',
        },
    ];
    const c = shallow(<Header columns={cols} />);

    expect(headerCell(c, 0).text()).toContain(cols[0].name);
    expect(headerCell(c, 1).text()).toContain(
        // @ts-ignore
        cols[1].type === 'group' ? cols[1].subColumns[0].name : 'error'
    );
    expect(headerCell(c, 2).text()).toContain(
        // @ts-ignore
        cols[1].type === 'group' ? cols[1].subColumns[1].name : 'error'
    );
    expect(headerCell(c, 3).text()).toContain(cols[2].name);

    expect(getByTestId(c, 'group')).toHaveLength(cols.length);
    expect(getByTestId(c, 'header')).toHaveLength(4);

    expect(groupCell(c, 1).props().colSpan).toBe(2);

    expect(groupCell(c, 1).text()).toContain(cols[1].name);
});

it('renders sort ASC', () => {
    const cols: Array<IColumn<IDataRow>> = [
        {
            name: 'col 1',
            field: 'col1',
            type: 'data',
        },
        {
            name: 'col 2',
            field: 'col2',
            type: 'data',
        },
        {
            name: 'col 3',
            field: 'col3',
            type: 'data',
        },
    ];
    const sort: ISortColumn = {
        field: 'col2',
        direction: 'ASC',
    };
    const sortAscLabel = 'v';
    const sortDescLabel = '^';
    const setSort = jest.fn();
    setGridContextData({ sort, setSort });

    const c = shallow(
        <Header
            columns={cols}
            sortAscLabel={sortAscLabel}
            sortDescLabel={sortDescLabel}
        />
    );

    expect(headerCell(c, 1).text()).toContain(sortAscLabel);
});

it('renders sort ASC custom', () => {
    const cols: Array<IColumn<IDataRow>> = [
        {
            name: 'col 1',
            field: 'col1',
            type: 'data',
        },
        {
            name: 'col 2',
            field: 'col2',
            type: 'data',
        },
        {
            name: 'col 3',
            field: 'col3',
            type: 'data',
        },
    ];
    const sort: ISortColumn = {
        field: 'col2',
        direction: 'ASC',
    };
    const sortAscLabel = '(ASC)';
    const sortDescLabel = '(DESC)';
    const setSort = jest.fn();
    setGridContextData({ sort, setSort });

    const c = shallow(
        <Header
            columns={cols}
            sortAscLabel={sortAscLabel}
            sortDescLabel={sortDescLabel}
        />
    );

    expect(headerCell(c, 1).text()).toContain(sortAscLabel);
});

it('renders sort DESC', () => {
    const cols: Array<IColumn<IDataRow>> = [
        {
            name: 'col 1',
            field: 'col1',
            type: 'data',
        },
        {
            name: 'col 2',
            field: 'col2',
            type: 'data',
        },
        {
            name: 'col 3',
            field: 'col3',
            type: 'data',
        },
    ];
    const sort: ISortColumn = {
        field: 'col2',
        direction: 'DESC',
    };
    const sortAscLabel = 'v';
    const sortDescLabel = '^';
    const setSort = jest.fn();
    setGridContextData({ sort, setSort });

    const c = shallow(
        <Header
            columns={cols}
            sortAscLabel={sortAscLabel}
            sortDescLabel={sortDescLabel}
        />
    );

    expect(headerCell(c, 1).text()).toContain(sortDescLabel);
});

it('non-sortable header clicked -> no sorting', () => {
    const cols: Array<IColumn<IDataRow>> = [
        {
            name: 'col 1',
            field: 'col1',
            type: 'data',
        },
        {
            name: 'col 2',
            field: 'col2',
            type: 'data',
        },
        {
            name: 'col 3',
            field: 'col3',
            type: 'data',
        },
    ];
    const sort = null;
    const sortAscLabel = 'v';
    const sortDescLabel = '^';
    const setSort = jest.fn();
    setGridContextData({ sort, setSort });

    const c = shallow(
        <Header
            columns={cols}
            sortAscLabel={sortAscLabel}
            sortDescLabel={sortDescLabel}
        />
    );

    headerCell(c, 1).simulate('click');
    expect(setSort).toHaveBeenCalledTimes(0);
});

it('no sort to sort -> ASC', () => {
    const cols: Array<IColumn<IDataRow>> = [
        {
            name: 'col 1',
            field: 'col1',
            type: 'data',
        },
        {
            name: 'col 2',
            field: 'col2',
            sortable: true,
            type: 'data',
        },
        {
            name: 'col 3',
            field: 'col3',
            type: 'data',
        },
    ];
    const sort = null;
    const sortAscLabel = 'v';
    const sortDescLabel = '^';
    const setSort = jest.fn();
    setGridContextData({ sort, setSort });

    const c = shallow(
        <Header
            columns={cols}
            sortAscLabel={sortAscLabel}
            sortDescLabel={sortDescLabel}
        />
    );

    headerCell(c, 1).simulate('click');
    expect(setSort).toBeCalledWith({ field: cols[1].field, direction: 'ASC' });
});

it('ASC sort col clicked -> DESC', () => {
    const cols: Array<IColumn<IDataRow>> = [
        {
            name: 'col 1',
            field: 'col1',
            type: 'data',
        },
        {
            name: 'col 2',
            field: 'col2',
            sortable: true,
            type: 'data',
        },
        {
            name: 'col 3',
            field: 'col3',
            type: 'data',
        },
    ];
    const sort: ISortColumn = {
        field: 'col2',
        direction: 'ASC',
    };
    const sortAscLabel = 'v';
    const sortDescLabel = '^';
    const setSort = jest.fn();
    setGridContextData({ sort, setSort });

    const c = shallow(
        <Header
            columns={cols}
            sortAscLabel={sortAscLabel}
            sortDescLabel={sortDescLabel}
        />
    );

    headerCell(c, 1).simulate('click');
    expect(setSort).toBeCalledWith({ field: cols[1].field, direction: 'DESC' });
});

it('DESC sort col clicked -> no sorting', () => {
    const cols: Array<IColumn<IDataRow>> = [
        {
            name: 'col 1',
            field: 'col1',
            type: 'data',
        },
        {
            name: 'col 2',
            field: 'col2',
            sortable: true,
            type: 'data',
        },
        {
            name: 'col 3',
            field: 'col3',
            type: 'data',
        },
    ];
    const sort: ISortColumn = {
        field: 'col2',
        direction: 'DESC',
    };
    const sortAscLabel = 'v';
    const sortDescLabel = '^';
    const setSort = jest.fn();
    setGridContextData({ sort, setSort });

    const c = shallow(
        <Header
            columns={cols}
            sortAscLabel={sortAscLabel}
            sortDescLabel={sortDescLabel}
        />
    );

    headerCell(c, 1).simulate('click');
    expect(setSort).toBeCalledWith(null);
});
