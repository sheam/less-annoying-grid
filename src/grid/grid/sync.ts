import { IDataState, IGridProps, IRowData } from './types-grid';
import { cloneData, hasChanged, uuid } from './util';
import { IGridState } from './state';
import
{
    IDataResult,
    IFieldFilter,
    IPagination,
    ISortColumn,
} from './types-pagination';
import
{
    IProgress,
    ISyncData,
    ISyncDataResult,
    SyncAction,
} from './types-sync';

export function syncDataEffect<TModel extends object>(
    state: IGridState<TModel>,
    props: IGridProps<TModel>
)
{
    const sync = async () =>
    {
        const result = await syncChanges(state, props);
        state.setNeedsSave(false);
        return result;
    };
    if (state.saveRequested && !state.validationErrors)
    {
        state.setSaveRequested(false);
        sync();
    }
}

export function loadDataEffect<TModel extends object>(
    state: IGridState<TModel>,
    getDataAsync: (
        p: IPagination | null,
        s: ISortColumn | null,
        f: IFieldFilter[]
    ) => Promise<IDataResult<TModel>>
)
{
    const fetch = async () =>
    {
        const d = await getDataAsync(
            state.pagination,
            state.sort,
            state.filters
        );
        const newState: IDataState<TModel> = {
            totalCount: d.totalCount,
            data: d.data.map((m, i) =>
            {
                const result: IRowData<TModel> = {
                    syncAction: SyncAction.unchanged,
                    model: m,
                    rowNumber: i + 1,
                    rowId: uuid(),
                    showDetail: false,
                    originalModel: cloneData(m),
                };
                return result;
            }),
        };
        state.setDataState(newState);
        state.setValidationErrors(false);
        state.setIsLoading(false);
    };

    state.setIsLoading(true);

    // noinspection JSIgnoredPromiseFromCall
    fetch();
}

export async function syncChanges<TModel extends object>(
    state: IGridState<TModel>,
    props: IGridProps<TModel>
): Promise<ISyncDataResult<TModel>[]>
{
    if (!props.editable)
    {
        throw new Error(
            'attempt to call syncChanges when grid is not editable'
        );
    }
    if (state.syncProgress)
    {
        throw new Error(
            'attempt to call syncChanges when sync already in progress'
        );
    }

    const changes = state.dataState.data
        .filter(r => hasChanged(r))
        .map(r =>
        {
            const result: ISyncData<TModel> = {
                model: r.model,
                rowId: r.rowId,
                syncAction: r.syncAction,
            };
            return result;
        });
    state.setSyncProgress({
        current: 0,
        total: changes.length,
        message: 'starting sync',
    });

    const applyUpdates = (
        p: IProgress,
        interim?: Array<ISyncDataResult<TModel>>
    ) => _applySyncResults(state, p, interim);

    try
    {
        const result = await props.editable.syncChanges(changes, applyUpdates);
        _applySyncResults(state, null, result);
        return result;
    } finally
    {
        state.setSyncProgress(null);
        console.log('done saving');
    }
}

export function _applySyncResults<TModel extends object>(
    state: IGridState<TModel>,
    progress: IProgress | null,
    results: Array<ISyncDataResult<TModel>> | undefined
): void
{
    if (progress)
    {
        state.setSyncProgress(progress);
    }
    const data = state.dataState.data;
    if (results)
    {
        for (let syncResult of results)
        {
            if (!syncResult.success)
            {
                continue;
            }
            const index = data.findIndex(er => er.rowId === syncResult.rowId);
            if (index < 0)
            {
                //we may have already updated this one.
                continue;
            }
            if (syncResult.syncAction === SyncAction.deleted)
            {
                state.dataState.data.splice(index, 1);
            } else
            {
                if (!syncResult.model)
                {
                    throw new Error('result model should not be null');
                }
                state.dataState.data[index] = {
                    model: syncResult.model,
                    syncAction: SyncAction.unchanged,
                    rowNumber: data[index].rowNumber,
                    rowId: uuid(),
                    showDetail: data[index].showDetail,
                    originalModel: cloneData(syncResult.model),
                };
            }
        }
        state.setDataState(state.dataState);
    }
}
