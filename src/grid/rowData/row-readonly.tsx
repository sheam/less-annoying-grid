import * as React from 'react';
import { ActionCell } from './cell-action';
import { ICellProps, IRowProps } from './types';

export const RowReadOnly = <TModel extends object>(
    props: IRowProps<TModel>
) => {
    const columns = props.columns.flatMap(c =>
        c.type === 'group' ? c.subColumns : c
    );
    const uid = props.data.rowId;

    return (
        <tr data-test="data-row">
            {columns.map(c => {
                if (c?.type === 'data') {
                    return (
                        <CellReadonly
                            key={`td-${uid}-${c.name}`}
                            column={c}
                            data={props.data}
                        />
                    );
                }
                if (c?.type === 'action') {
                    return (
                        <ActionCell
                            key={`td-${uid}-${c.name}`}
                            column={c}
                            data={props.data}
                        />
                    );
                }
                throw new Error('unexpected cell type');
            })}
        </tr>
    );
};

export const CellReadonly = <TModel extends object>({
    column: { field, hidden, renderDisplay },
    data,
}: ICellProps<TModel>) => {
    return (
        <td hidden={hidden}>
            {renderDisplay && renderDisplay(data.model)}
            {!renderDisplay && field && (data.model as any)[field].toString()}
        </td>
    );
};
