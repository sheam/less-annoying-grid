import * as React from 'react';
import
{
    Column,
    Grid,
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
import
{
    addData,
    deleteData,
    getData as getMockData,
    IData as IMockData,
    updateData,
} from './mock-data';
import './styles.css';
import { useGridContext, validate } from '../../grid';
import { ToolBar } from './toolbar';
import { CustomEditorExample } from './custom-editor-example';

const TestGrid: React.FunctionComponent = (): JSX.Element =>
{
    return (
        <div className="container">
            <Grid
                columns={cols}
                sortAscLabel="(ASC)"
                sortDescLabel="(DESC)"
                getDataAsync={getDataAsync}
                footer={{ initialPageSize: 10 }}
                renderRowDetail={detailTemplate}
                rowDetailButtonShowingContent="hide"
                rowDetailButtonHiddenContent="show"
                editable={{
                    editMode: GridEditMode.external,
                    autoSave: false,
                    addToBottom: false,
                    syncChanges: syncDataAsync,
                    modelTypeName: 'Product',
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

function detailTemplate(m: IMockData): JSX.Element
{
    return (
        <div>
            <div>
                <label>Num</label>
                {m.num}
            </div>
            <div>
                <label>Key</label>
                {m.key}
            </div>
        </div>
    );
}

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
        defaultValue: 50,
        validator: validate.validator(
            validate.min(10),
            validate.max(90),
            validate.required()
        ),
    },
    {
        name: 'Col 1',
        field: 'one',
        type: 'data',
        defaultValue: () => `n-${Math.round(Math.random() * 1000)}`,
        editable: {
            type: 'custom',
            editor: <CustomEditorExample field={'one'} />,
        },
        validator: validate.validator(
            validate.minLen(3),
            validate.maxLen(6),
            validate.required()
        ),
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
            values: [1, 2, 3, 4].map(n =>
            {
                return { text: n.toString(), value: n };
            }),
        },
    },
    {
        name: 'Display (3B)',
        type: 'display',
        renderDisplay: m => <u>{m.threeB}</u>,
    },
    {
        type: 'action',
        name: 'actions',
        actions: [
            {
                type: 'delete',
                buttonContent: 'DEL',
                confirm: (m, _) =>
                {
                    return new Promise<boolean>(resolve =>
                    {
                        resolve(
                            window.confirm(
                                `Are you sure you would like to delete the row with Key=${m.key}`
                            )
                        );
                    });
                },
            },
            {
                type: 'edit',
                buttonContent: 'Edit',
            },
        ],
    },
];

const SyncProgress: React.FunctionComponent = () =>
{
    const { editingContext } = useGridContext();
    const progress = editingContext?.syncProgress;
    if (!progress)
    {
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
): Promise<IDataResult<IMockData>>
{
    return new Promise<IDataResult<IMockData>>(resolve =>
    {
        const data = getMockData(pagination, sort, filters);
        setTimeout(() =>
        {
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
): Promise<Array<ISyncDataResult<IMockData>>>
{
    return new Promise<Array<ISyncDataResult<IMockData>>>(resolve =>
    {
        const results: Array<ISyncDataResult<IMockData>> = [];
        let count = 0;
        for (let change of changes)
        {
            if (!change.model)
            {
                throw new Error('change should never be null');
            }

            let resultModel: IMockData | null;
            switch (change.syncAction)
            {
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
