import { IRowData } from './types-grid';
import { SyncAction } from './types-sync';
import { Column, NonGroupColumn } from './columns/types';

export function cloneData<TModel>(model: TModel): TModel
{
    return JSON.parse(JSON.stringify(model));
}

export function shallowClone<TModel>(model: TModel): TModel
{
    return Object.assign({}, model);
}

export function getNewSyncAction(
    current: SyncAction,
    newAction: SyncAction
): SyncAction
{
    if (newAction === SyncAction.unchanged)
    {
        return current;
    }

    if (current === SyncAction.unchanged)
    {
        if (newAction === SyncAction.updated)
        {
            return newAction;
        }
    }

    if (current === SyncAction.added)
    {
        if (newAction === SyncAction.updated)
        {
            return current;
        }
    }

    if (current === SyncAction.updated)
    {
        if (
            newAction === SyncAction.deleted ||
            newAction === SyncAction.updated
        )
        {
            return newAction;
        }
    }

    throw new Error(
        `new '${newAction}' state not supported on an '${current}' row`
    );
}

export const hasChanged = <TModel extends object>(rowData: IRowData<TModel>) =>
    rowData.syncAction !== SyncAction.unchanged;

//stealing from interwebs until next ES release which is supposed to have UID module
export function uuid(): string
{
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c =>
    {
        const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8; // eslint-disable-line
        return v.toString(16);
    });
}

export function getNonGroupColumns<TModel extends object>(
    columns: Array<Column<TModel>>
): Array<NonGroupColumn<TModel>>
{
    if (!columns)
    {
        throw new Error('columns parameter must not be null or undefined');
    }

    const result = columns.flatMap(c =>
    {
        if (c === undefined)
        {
            throw new Error('cant be null');
        }
        if (c.type === 'group')
        {
            return c.subColumns;
        }
        return c;
    });

    // @ts-ignore
    return result as NonGroupColumn<TModel>;
}

export function fdate(date: Date): string
{
    if (!date)
    {
        return '';
    }

    const pad = (n: number) => (n < 10 ? `0${n}` : n.toString());

    const d = pad(date.getDate());
    const m = pad(date.getMonth() + 1);
    const y = pad(date.getFullYear());

    return `${y}-${m}-${d}`;
}

export function deepEqual(a: any, b: any): boolean
{
    return JSON.stringify(a) === JSON.stringify(b);
}
