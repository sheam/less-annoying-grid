export enum SyncAction
{
    unchanged = 'unchanged',
    added = 'added',
    updated = 'updated',
    deleted = 'deleted',
}

export interface ISyncData<TModel extends object>
{
    model: TModel | null;
    rowId: string;
    syncAction: SyncAction;
}

export interface ISyncDataResult<TModel extends object>
    extends ISyncData<TModel>
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
