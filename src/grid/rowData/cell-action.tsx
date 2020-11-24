import { IActionColumn, IRowData } from '../types';
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
            {column.actions.map(a => (
                <button
                    className={`action-${a.name}`}
                    key={`action-${a.name}`}
                    onClick={() =>
                        a.handler(data.model, data.rowId, data.syncAction)
                    }
                >
                    {a.buttonContent}
                </button>
            ))}
        </td>
    );
};
