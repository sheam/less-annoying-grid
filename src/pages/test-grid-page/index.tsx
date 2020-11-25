/* tslint:disable:max-line-length no-magic-numbers no-console jsx-no-multiline-js jsx-no-lambda */
import * as React from 'react';
import { FormEvent, useContext } from 'react';
import {
    Column,
    Grid,
    GridContext,
    GridEditMode,
    IDataResult,
    IFieldFilter,
    IPagination,
    IProgress,
    ISortColumn,
    ISyncData,
    ISyncDataResult,
    SyncAction,
} from '../../grid';
import {
    addData,
    deleteData,
    getData as getMockData,
    IData as IMockData,
    updateData,
} from './mock-data';
import './styles.css';
import { useGridContext } from '../../grid/context';

const TestGrid: React.FunctionComponent = (): JSX.Element => {
    return (
        <div className="container">
            <Grid
                columns={cols}
                sortAscLabel="(ASC)"
                sortDescLabel="(DESC)"
                getDataAsync={getDataAsync}
                footer={{ initialPageSize: 10 }}
                editable={{
                    editMode: GridEditMode.inline,
                    autoSave: true,
                    syncChanges: syncDataAsync,
                }}
            >
                {{
                    toolbar: <ToolBar />,
                    emptyState: <i>no data</i>,
                    loadingState: <i>the data is loading</i>,
                    savingState: <SyncProgress />,
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
        type: 'data',
    },
    {
        name: 'Col 0',
        field: 'num',
        type: 'data',
        editable: { type: 'number', min: 0, max: 100, step: 5 },
    },
    {
        name: 'Col 1',
        field: 'one',
        type: 'data',
        editable: { type: 'text', maxLength: 4 },
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
        editable: {
            type: 'values',
            subType: 'number',
            values: [
                { text: 'one', value: 1 },
                { text: 'two', value: 2 },
                { text: 'three', value: 3 },
                { text: 'four', value: 4 },
            ],
        },
    },
    {
        name: 'Col 5',
        field: 'five',
        sortable: true,
        type: 'data',
        editable: {
            type: 'values',
            subType: 'number',
            values: [1, 2, 3, 4].map(n => {
                return { text: n.toString(), value: n };
            }),
        },
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
interface IToolbarProps {}

const ToolBar: React.FunctionComponent<IToolbarProps> = () => {
    const {
        setSort,
        filters,
        setFilters,
        resetPagination,
        editingContext,
    } = useContext(GridContext);
    if (!setSort || !setFilters || !resetPagination) {
        throw new Error('configuration error');
    }

    const filterChanged = (e: FormEvent): void => {
        resetPagination();
        const val = (e.target as any).value.toString();
        if (!val) {
            setFilters([]);
        } else {
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
    if (filters && filters.length > 0) {
        currentFilter = filters[0].value;
    }
    const canSave = editingContext?.needsSave || editingContext?.syncProgress;
    const saveClicked = async (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!canSave) {
            throw new Error('save clicked when canSave is false');
        }
        if (!editingContext?.sync) {
            throw new Error('save clicked when editing context is null');
        }
        await editingContext.sync();
    };
    return (
        <div>
            <h4>Product SKUs</h4>
            <button
                onClick={() => setSort({ field: 'four', direction: 'ASC' })}
            >
                Sort By Col 4 ASC
            </button>
            <button
                onClick={() => setSort({ field: 'four', direction: 'DESC' })}
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
            <button
                disabled={!canSave}
                onClick={async e => {
                    await saveClicked(e);
                }}
            >
                Save
            </button>
        </div>
    );
};

const SyncProgress: React.FunctionComponent<{}> = () => {
    const { editingContext } = useGridContext();
    const progress = editingContext?.syncProgress;
    if (!progress) {
        return null;
    }
    return (
        <div>
            <div>
                Syncing {progress.current} of {progress.total} (
                {Math.round((100 * progress.current) / progress.total)}%)
            </div>
            <small>{progress.message}</small>
        </div>
    );
};

function getDataAsync(
    pagination: IPagination | null,
    sort: ISortColumn | null,
    filters: IFieldFilter[]
): Promise<IDataResult<IMockData>> {
    return new Promise<IDataResult<IMockData>>(resolve => {
        const data = getMockData(pagination, sort, filters);
        setTimeout(() => {
            resolve(data);
        }, 1000);
    });
}

function syncDataAsync(
    changes: Array<ISyncData<IMockData>>,
    updateProgress: (
        p: IProgress,
        interimResults?: Array<ISyncDataResult<IMockData>>
    ) => void
): Promise<Array<ISyncDataResult<IMockData>>> {
    return new Promise<Array<ISyncDataResult<IMockData>>>(resolve => {
        const results: Array<ISyncDataResult<IMockData>> = [];
        let count = 0;
        for (let change of changes) {
            if (!change.model) {
                throw new Error('change should never be null');
            }

            let resultModel: IMockData | null;
            switch (change.syncAction) {
                case SyncAction.updated:
                    resultModel = updateData(change.model);
                    break;
                case SyncAction.added:
                    resultModel = addData(change.model);
                    break;
                case SyncAction.deleted:
                    deleteData(change.model);
                    resultModel = null;
                    break;
                default:
                    throw new Error(
                        `Syncing ${change.syncAction} not supported. Item key=${change.model.key}`
                    );
            }

            const syncResult: ISyncDataResult<IMockData> = {
                model: resultModel,
                syncAction: change.syncAction,
                rowId: change.rowId,
                success: true,
            };
            results.push(syncResult);

            count++;
            updateProgress(
                {
                    total: changes.length,
                    current: count,
                    message: `synced item with key ${change.model.key}`,
                },
                [syncResult]
            );
        }
        setTimeout(() => resolve(results), 1000);
    });
}
