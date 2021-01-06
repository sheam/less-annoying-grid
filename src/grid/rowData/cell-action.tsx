import * as React from 'react';
import { IRowData } from '../types-grid';
import { IActionColumn } from '../columns/types';
import { ActionButton } from './action-button';

interface IActionCellProps<TModel extends object>
{
    column: IActionColumn<TModel>;
    rowData: IRowData<TModel>;
}

export const ActionCell = <TModel extends object>({
    column,
    rowData,
}: IActionCellProps<TModel>) =>
{
    return (
        <td hidden={column.hidden} className={column.className}>
            {column.actions.map((a, i) => (
                <ActionButton key={i} action={a} rowData={rowData} />
            ))}
        </td>
    );
};
