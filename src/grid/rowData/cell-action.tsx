import { Action, IActionColumn, IRowData } from '../types';
import * as React from 'react';

interface IActionCellProps<TModel extends object> {
    column: IActionColumn<TModel>;
    data: IRowData;
}

export const ActionCell = <TModel extends object>({
    column,
    data,
}: IActionCellProps<TModel>) => {
    return (
        <td hidden={column.hidden}>
            {column.actions.map((a, i) => (
                <ActionButton
                    key={`${a.type}-${a.name || 'noname'}-${i}`}
                    action={a}
                />
            ))}
        </td>
    );
};

interface IActionButtonProps<TModel extends object> {
    action: Action<TModel>;
}

export const ActionButton = <TModel extends object>({
    action,
}: IActionButtonProps<TModel>) => {
    const name = action.name || action.type;
    const content = action.buttonContent || <>{name}</>;
    //TODO: add handler here.... this is likely easier after dispatch is done
    return <button className={`action-${name}`}>{content}</button>;
};
