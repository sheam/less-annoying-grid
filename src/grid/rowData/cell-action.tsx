import * as React from 'react';
import { IRowData } from '../grid/types';
import { IActionColumn } from '../columns/column-types';
import { ActionButton } from './action-button';

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
