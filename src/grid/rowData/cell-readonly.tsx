import * as React from 'react';
import { ValidationError } from './validation-error';
import { Column } from '../..';
import { IRowData } from '../types-grid';

interface ICellProps<TModel extends object>
{
    column: Column<TModel>;
    data: IRowData<TModel>;
}

export const CellReadonly = <TModel extends object>({
    column,
    data,
}: ICellProps<TModel>) =>
{
    const c = column;

    if (c.type === 'data')
    {
        return (
            <td hidden={c.hidden} className={column.className}>
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
        return <td className={column.className}>{c.renderDisplay(data.model)}</td>;
    }

    throw new Error(`Unexpected type for CellReadonly: '${c.type}'`);
};
