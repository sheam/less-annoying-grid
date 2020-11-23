/* tslint:disable:max-line-length no-magic-numbers no-console jsx-no-multiline-js jsx-no-lambda */
import * as React from 'react';
import {FormEvent, useContext} from 'react';
import {Column, Grid, GridContext, IDataResult, IFieldFilter, IPagination, ISortColumn} from "../../grid";

const TestGrid: React.FunctionComponent = (): JSX.Element =>
{

    return (
            <Grid
                columns={cols}
                sortAscLabel="(ASC)"
                sortDescLabel="(DESC)"
                getDataAsync={getDataAsync}
                editable={{
                    editMode: "inline",
                    addModelAsync: (m) => new Promise<IData>(() => m),
                    updateModelAsync: (m) => new Promise<IData>(() => m),
                    deleteModelAsync: (m) => new Promise<void>(() => {})
                }}
            >
                {{
                    toolbar: <ToolBar/>,
                    emptyState: <i>no data</i>,
                    transmittingState: <i>the data is loading</i>,
                }}
            </Grid>
    );
};

export default TestGrid;

const cols: Array<Column<IData>> = [
    {
        name: 'Col 0',
        field: 'num',
        type: 'data',
        editable: 'number'
    },
    {
        name: 'Col 1',
        field: 'one',
        type: 'data',
        editable: 'text'
    },
    {
        name: 'Group 1',
        type: 'group',
        subColumns: [
            {
                name: 'Col 2',
                field: 'two',
                type: 'data',
            },
            {
                name: 'Col 3A',
                field: 'threeA',
                hidden: false,
                type: 'data',
            },
            {
                name: 'Col 3B',
                field: 'threeB',
                renderDisplay: m => <u>{m.threeB}</u>,
                type: 'data',
            },
            {
                name: 'Col 3C',
                field: 'threeC',
                renderDisplay: m => <u>3c-{m.threeB}</u>,
                type: 'data',
            },
        ],
    },
    {
        name: 'Col 4',
        field: 'four',
        hidden: false,
        type: 'data',
    },
    {
        name: 'Col 5',
        field: 'five',
        sortable: true,
        type: 'data',
    },
    // {
    //     type: 'action',
    //     name: 'actions',
    //     actions: [
    //         {
    //             name: 'delete',
    //             buttonContent: 'DEL',
    //             handler: ((data, uid, dirty) => )
    //         }
    //     ]
    // }
];

// tslint:disable-next-line:no-empty-interface
interface IToolbarProps
{
}

const ToolBar: React.FunctionComponent<IToolbarProps> = () =>
{
    const {setSort, filters, setFilters} = useContext(GridContext);
    if(!setSort||!setFilters)
    {
        throw new Error('setSort or setFilters not defined');
    }

    const filterChanged = (e: FormEvent): void =>
    {
        const val = (e.target as any).value.toString();
        if (!val)
        {
            setFilters([]);
        }
        else
        {
            setFilters([
                                 {
                                     field: 'four',
                                     operator: 'contains',
                                     value: val,
                                 },
                             ]);
        }
    };

    let currentFilter = '';
    if (filters && filters.length > 0)
    {
        currentFilter = filters[0].value;
    }
    return (
        <div>
            <h4>Product SKUs</h4>
            <button
                onClick={() => setSort({field: 'four', direction: 'ASC'})}
            >
                Sort By Col 4 ASC
            </button>
            <button
                onClick={() => setSort({field: 'four', direction: 'DESC'})}
            >
                Sort By Col 4 DESC
            </button>
            <label>
                Filter:
                <select value={currentFilter} onChange={filterChanged}>
                    <option value="">none</option>
                    <option value="100">100's</option>
                    <option value="200">200's</option>
                </select>
            </label>
        </div>
    );

};

interface IData
{
    num: number;
    one: string;
    two: string;
    threeA: string;
    threeB: string;
    four: string;
    five: string;
}

const _data = generateData(1000);

function generateData(n: number)
{
    const result: IData[] = [];
    for (let i = 0; i < n; i++)
    {
        const rowNum = i + 1;
        result.push({
                        num: 100+i,
                        one: `${rowNum}-1`,
                        two: `${rowNum}-2`,
                        threeA: `${rowNum}-3a`,
                        threeB: `${rowNum}-3b`,
                        four: `${rowNum}-4`,
                        five: `${rowNum}-5`,
                    });
    }
    return result;
}

function getDataAsync(pagination: IPagination, sort: ISortColumn|null, filters: IFieldFilter[]): Promise<IDataResult<IData>>
{
    return new Promise<IDataResult<IData>>(resolve => {
        const data = getData(pagination, sort, filters);
        setTimeout(() => {
            resolve(data);
        }, 0);
    });
}

function getData(pagination: IPagination, sort: ISortColumn|null, filters: IFieldFilter[]): IDataResult<IData>
{
    console.log('getting data');

    const compare = (a: IData, b: IData): number =>
    {
        if(!sort) return 0;

        const aVal = (a as any)[sort.field].toString();
        const bVal = (b as any)[sort.field].toString();
        let compareResult = 0;
        if (aVal < bVal)
        {
            compareResult = -1;
        }
        if (aVal > bVal)
        {
            compareResult = 1;
        }
        if (sort.direction === 'DESC')
        {
            compareResult *= -1;
        }
        return compareResult;
    };

    let data = sort ? _data.slice(0).sort(compare) : _data;
    if (filters)
    {
        for (const f of filters)
        {
            if (f.field === 'four' && f.operator === 'contains')
            {
                data = data.filter(x => x.four.indexOf(f.value) >= 0);
            }
        }
    }

    const skip = (pagination.currentPage - 1) * pagination.pageSize;
    return {
        data: data
            .slice(skip, skip + pagination.pageSize),
        totalCount: data.length,
    };
}
