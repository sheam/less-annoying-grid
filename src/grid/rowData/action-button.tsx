import * as React from 'react';
import { IGridContext, useGridContext } from '../context';
import { IRowData } from '../types-grid';
import { Action } from '../columns/types';
import { SyncAction } from '../types-sync';

interface IActionButtonProps<TModel extends object>
{
    action: Action<TModel>;
    rowData: IRowData<TModel>;
}

export const ActionButton = <TModel extends object>({
    action,
    rowData,
}: IActionButtonProps<TModel>) =>
{
    const context = useGridContext<TModel>();
    const name = action.name || action.type;
    const content = action.buttonContent || <>{name}</>;
    const handler = getHandler(action, rowData, context);
    return (
        <button onClick={handler} className={`action-${name}`}>
            {content}
        </button>
    );
};

function getHandler<TModel extends object>(
    action: Action<TModel>,
    rowData: IRowData<TModel>,
    context: IGridContext<TModel>
)
{
    const modelTypeName = context.editingContext?.modelTypeName || 'item';
    return () =>
    {
        switch (action.type)
        {
            case 'delete':
                if (action.confirm)
                {
                    if (action.confirm === true)
                    {
                        if (window.confirm(`Delete ${modelTypeName}?`))
                        {
                            context.editingContext?.deleteRow(rowData.rowId);
                        }
                    } else
                    {
                        action
                            .confirm(rowData.model, rowData.syncAction)
                            .then(doDelete =>
                            {
                                if (doDelete)
                                {
                                    context.editingContext?.deleteRow(rowData.rowId);
                                }
                            });
                    }
                }
                break;

            case 'edit':
                context.editingContext?.setEditField(null, rowData);
                break;

            case 'custom':
                const changes = action.handler(
                    rowData.model,
                    rowData.rowId,
                    rowData.syncAction
                );
                if (changes)
                {
                    for (let change of changes)
                    {
                        if (!change.model)
                        {
                            throw new Error(
                                'the changed model must not be null'
                            );
                        }
                        switch (change.syncAction)
                        {
                            case SyncAction.deleted:
                                context.editingContext?.deleteRow(rowData.rowId);
                                break;
                            case SyncAction.added:
                                context.editingContext?.addRow(change.model);
                                break;
                            case SyncAction.updated:
                                context.editingContext?.updateRow(change.rowId, change.model);
                                break;
                        }
                    }
                }
                break;
        }
    };
}