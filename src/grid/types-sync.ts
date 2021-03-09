export enum SyncAction
{
    unchanged = 'unchanged',
    added = 'added',
    updated = 'updated',
    deleted = 'deleted',
}

export interface ISyncData<TSummaryModel extends object>
{
    model: TSummaryModel | null;
    rowId: string;
    syncAction: SyncAction;
}

export interface ISyncDataResult<TSummaryModel extends object>
    extends ISyncData<TSummaryModel>
{
    success: boolean;
    error?: string;
}

export interface IProgress
{
    current: number;
    total: number;
    message?: string;
}
