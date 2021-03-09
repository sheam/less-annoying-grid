import * as React from 'react';
import { IRowData } from '../types-grid';
import { IActionColumn } from '../columns/types';
import { ActionButton } from './action-button';

interface IActionCellProps<TSummaryModel extends object>
{
    column: IActionColumn<TSummaryModel>;
    rowData: IRowData<TSummaryModel>;
}

export const ActionCell = <TSummaryModel extends object>({
    column,
    rowData,
}: IActionCellProps<TSummaryModel>) =>
{
    return (
        <td hidden={column.hidden} className={column.className}>
            {column.actions.map((a, i) => (
                <ActionButton key={i} action={a} rowData={rowData} />
            ))}
        </td>
    );
};
