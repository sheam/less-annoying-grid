/* tslint:disable:max-line-length no-magic-numbers no-console jsx-no-multiline-js jsx-no-lambda */
import * as React from 'react';
import {FormEvent, useContext} from 'react';
import {Column, Grid, GridContext, IDataResult, IFieldFilter, IPagination, ISortColumn} from "../../grid";
import {getData as getMockData, IData as IMockData, update} from "./mock-data";
import './styles.css';

const TestGrid: React.FunctionComponent = (): JSX.Element =>
{

    return (
        <div className="container">
            <Grid
                columns={cols}
                sortAscLabel="(ASC)"
                sortDescLabel="(DESC)"
                getDataAsync={getDataAsync}
                editable={{
                    editMode: "inline",
                    autoSave: true,
                    addModelAsync: (m) => new Promise<IMockData>(() => m),
                    updateModelAsync: (m) => updateDataAsync(m),
                    deleteModelAsync: (m) => new Promise<void>(() => {})
                }}
            >
                {{
                    toolbar: <ToolBar/>,
                    emptyState: <i>no data</i>,
                    loadingState: <i>the data is loading</i>,
                }}
            </Grid>
        </div>
    );
};

export default TestGrid;

const cols: Array<Column<IMockData>> = [
    {
        name: 'Key',
        field: 'key',
        type: 'data'
    },
    {
        name: 'Col 0',
        field: 'num',
        type: 'data',
        editable: { type: 'number', min: 0, max: 100, step: 5  }
    },
    {
        name: 'Col 1',
        field: 'one',
        type: 'data',
        editable: { type: 'text', maxLength: 4  }
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
        editable: { type: 'values', subType: 'number', values: [
            { text: 'one', value: 1},
            { text: 'two', value: 2},
            { text: 'three', value: 3},
            { text: 'four', value: 4},
        ]}
    },
    {
        name: 'Col 5',
        field: 'five',
        sortable: true,
        type: 'data',
        editable: { type: 'values', subType: 'number', values: [1,2,3,4].map(n => { return { text: n.toString(), value: n }})}
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
    const {setSort, filters, setFilters, resetPagination} = useContext(GridContext);
    if(!setSort||!setFilters||!resetPagination)
    {
        throw new Error('configuration error');
    }

    const filterChanged = (e: FormEvent): void =>
    {
        resetPagination();
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
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                </select>
            </label>
        </div>
    );

};

function getDataAsync(pagination: IPagination, sort: ISortColumn|null, filters: IFieldFilter[]): Promise<IDataResult<IMockData>>
{
    return new Promise<IDataResult<IMockData>>(resolve => {
        const data = getMockData(pagination, sort, filters);
        setTimeout(() => {
            resolve(data);
        }, 1000);
    });
}

function updateDataAsync(model: IMockData): Promise<IMockData>
{
    return new Promise<IMockData>(resolve => {
        const result = update(model);
        setTimeout(() => {
            resolve(result);
        }, 3000);
    });
}


