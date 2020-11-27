import * as React from 'react';
import { ActionCell } from './cell-action';
import { IRowProps } from './types';
import { CellReadonly } from './cell-readonly';

export const RowReadOnly = <TModel extends object>(
    props : IRowProps<TModel>
) =>
{
    const columns = props.columns.flatMap(c =>
        c.type === 'group' ? c.subColumns : c
    );
    const uid = props.data.rowNumber;

    return (
        <tr data-test="data-row" className="data-row">
            {columns.map(c =>
            {
                if (c?.type === 'data' || c?.type === 'display')
                {
                    return (
                        <CellReadonly
                            key={`td-${uid}-${c.name}`}
                            column={c}
                            data={props.data}
                        />
                    );
                }
                if (c?.type === 'action')
                {
                    return (
                        <ActionCell
                            key={`td-${uid}-${c.name}`}
                            column={c}
                            rowData={props.data}
                        />
                    );
                }
                throw new Error('unexpected cell type');
            })}
        </tr>
    );
};
