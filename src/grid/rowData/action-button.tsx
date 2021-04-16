import * as React from 'react';
import { IGridContext, useGridContext } from 'grid/context';
import { IRowData } from 'grid/types-grid';
import { Action, ActionStatus } from 'grid/columns/types';
import { SyncAction } from 'grid/types-sync';
import { shallowClone } from '../util';

interface IActionButtonProps<TSummaryModel extends object>
{
    action: Action<TSummaryModel>;
    rowData: IRowData<TSummaryModel>;
}

export const ActionButton = <TSummaryModel extends object, TEditModel extends object, TDetailModel extends object>({
    action,
    rowData,
}: IActionButtonProps<TSummaryModel>) =>
{
    const context = useGridContext<TSummaryModel, TEditModel, TDetailModel>();
    const name = action.name || action.type;
    const state = action.buttonState ? action.buttonState(rowData.model, rowData.rowId, rowData.syncAction) : ActionStatus.Active;
    const content = action.buttonContent || <>{name}</>;
    const handler = getHandler(action, rowData, context);
    return (
        <button
            onClick={handler}
            className={`action-${name}`}
            disabled={state === ActionStatus.Disabled}
            hidden={state === ActionStatus.Hidden}
        >
            {content}
        </button>
    );
};

function getHandler<TSummaryModel extends object, TEditModel extends object, TDetailModel extends object>(
    action: Action<TSummaryModel>,
    rowData: IRowData<TSummaryModel>,
    context: IGridContext<TSummaryModel, TEditModel, TDetailModel>
)
{
    const modelTypeName = context.editingContext?.modelTypeName || 'item';
    return () =>
    {
        switch (action.type)
        {
            case 'delete':
                if (action.confirm === true || action.confirm === undefined)
                {
                    if (window.confirm(`Delete ${modelTypeName}?`))
                    {
                        context.editingContext?.deleteRow(rowData.rowId);
                    }
                }
                else if (action.confirm)
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
                else
                {
                    context.editingContext?.deleteRow(rowData.rowId);
                }

                break;

            case 'edit':
                context.editingContext?.setEditField(null, rowData);
                break;

            case 'custom':
                const changes = action.handler(
                    shallowClone(rowData.model),
                    rowData.rowId,
                    rowData.syncAction,
                    context.pushRoute,
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
                        const editModel = (change.model as any) as TEditModel;
                        switch (change.syncAction)
                        {
                            case SyncAction.deleted:
                                context.editingContext?.deleteRow(rowData.rowId);
                                break;
                            case SyncAction.added:
                                context.editingContext?.addRow(editModel);
                                break;
                            case SyncAction.updated:
                                context.editingContext?.updateRow(change.rowId, editModel);
                                break;
                        }
                    }
                }
                break;
        }
    };
}
