import * as React from 'react';
import { IDataState, IGridProps, IRowData } from './types-grid';
import { cloneData, hasChanged, uuid } from './util';
import { IGridState } from './state';
import
{
    IProgress,
    ISyncData,
    ISyncDataResult,
    SyncAction,
} from './types-sync';

export function useSyncDataEffect<TSummaryModel extends object, TEditModel extends object, TDetailModel extends object>(state: IGridState<TSummaryModel>, props: IGridProps<TSummaryModel, TEditModel, TDetailModel>)
{
    const sync = async () =>
    {
        const result = await syncChanges(state, props);
        state.setNeedsSave(false);
        return result;
    };
    React.useEffect(() =>
    {
        if (state.saveRequested && !state.validationErrors && !state.editField)
        {
            state.setSaveRequested(false);
            sync();
        }
    },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [state.saveRequested, state.validationErrors, state.editField]
    );
}

export function useLoadDataEffect<TSummaryModel extends object, TEditModel extends object, TDetailModel extends object>(state: IGridState<TSummaryModel>, props: IGridProps<TSummaryModel, TEditModel, TDetailModel>)
{
    const fetch = async () =>
    {
        const d = await props.getDataAsync(
            state.pagination,
            state.sort,
            state.filters
        );
        const newState: IDataState<TSummaryModel> = {
            totalCount: d.totalCount,
            data: d.data.map((m, i) =>
            {
                const result: IRowData<TSummaryModel> = {
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

    React.useEffect(
        () =>
        {
            state.setIsLoading(true);
            // noinspection JSIgnoredPromiseFromCall
            fetch();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [state.pagination, state.sort, state.filters, props.getDataAsync]
    );
}

export async function syncChanges<TSummaryModel extends object, TEditModel extends object, TDetailModel extends object>(
    state: IGridState<TSummaryModel>,
    props: IGridProps<TSummaryModel, TEditModel, TDetailModel>
): Promise<ISyncDataResult<TSummaryModel>[]>
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
            const result: ISyncData<TEditModel> = {
                model: (<any>r.model) as TEditModel,
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
        interim?: Array<ISyncDataResult<TSummaryModel>>
    ) => _applySyncResults(state, p, interim);

    try
    {
        const result = await props.editable.syncChanges(changes, applyUpdates);
        _applySyncResults(state, null, result);
        return result;
    } finally
    {
        state.setSyncProgress(null);
    }
}

export function _applySyncResults<TSummaryModel extends object>(
    state: IGridState<TSummaryModel>,
    progress: IProgress | null,
    results: Array<ISyncDataResult<TSummaryModel>> | undefined
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
