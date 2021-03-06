import * as React from 'react';
import { ValidationError } from './validation-error';
import { Column } from '../..';
import { IRowData } from '../types-grid';

interface ICellProps<TSummaryModel extends object>
{
    column: Column<TSummaryModel>;
    data: IRowData<TSummaryModel>;
}

export const CellReadonly = <TSummaryModel extends object>({
    column,
    data,
}: ICellProps<TSummaryModel>) =>
{
    const c = column;

    if (c.type === 'data')
    {
        return (
            <td hidden={c.hidden} className={c.className}>
                {c.renderDisplay && c.renderDisplay(data.model)}
                {!c.renderDisplay && (data.model as any)[c.field]?.toString()}
                <ValidationError
                    field={c.field}
                    validationErrors={data.validationErrors}
                />
            </td>
        );
    }
    if (c.type === 'display')
    {
        return <td className={c.className}>{c.renderDisplay(data.model)}</td>;
    }

    throw new Error(`Unexpected type for CellReadonly: '${c.type}' for column ${c.name}`);
};
