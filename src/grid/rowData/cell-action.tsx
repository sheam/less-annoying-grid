import { Action, IActionColumn, IRowData, SyncAction } from '../types';
import * as React from 'react';
import { IGridContext, useGridContext } from '../state/context';

interface IActionCellProps<TModel extends object> {
    column: IActionColumn<TModel>;
    rowData: IRowData;
}

export const ActionCell = <TModel extends object>({
    column,
    rowData,
}: IActionCellProps<TModel>) => {
    return (
        <td hidden={column.hidden}>
            {column.actions.map((a, i) => (
                <ActionButton key={i} action={a} rowData={rowData} />
            ))}
        </td>
    );
};

interface IActionButtonProps<TModel extends object> {
    action: Action<TModel>;
    rowData: IRowData;
}

export const ActionButton = <TModel extends object>({
    action,
    rowData,
}: IActionButtonProps<TModel>) => {
    const context = useGridContext();
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
    rowData: IRowData,
    context: IGridContext
) {
    return () => {
        switch (action.type) {
            case 'delete':
                if (action.confirm) {
                    if (action.confirm === true) {
                        if (window.confirm(`Delete item?`)) {
                            context.editingContext?.deleteRow(rowData);
                        }
                    } else {
                        action
                            .confirm(rowData.model, rowData.syncAction)
                            .then(doDelete => {
                                if (doDelete) {
                                    context.editingContext?.deleteRow(rowData);
                                }
                            });
                    }
                }
                break;

            case 'edit':
                context.editingContext?.setEditField(null, rowData.rowNumber);
                break;

            case 'custom':
                const changes = action.handler(
                    rowData.model,
                    rowData.rowId,
                    rowData.syncAction
                );
                if (changes) {
                    for (let change of changes) {
                        switch (change.syncAction) {
                            case SyncAction.deleted:
                                context.editingContext?.deleteRow(rowData);
                                break;
                            case SyncAction.added:
                                context.editingContext?.addRow(change.model);
                                break;
                            case SyncAction.updated:
                                context.editingContext?.updateRow({
                                    model: change.model,
                                    rowNumber: -1,
                                    rowId: change.rowId,
                                    syncAction: SyncAction.updated,
                                });
                                break;
                        }
                    }
                }
                break;
        }
    };
}
