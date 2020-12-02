import * as React from 'react';
import { ActionCell } from './cell-action';
import { IRowProps } from './types';
import { CellReadonly } from './cell-readonly';
import { RowDetailTemplateTriggerCell } from "./detail-template";
import { useGridContext } from "../context";

export const RowReadOnly = <TModel extends object>(
    props: IRowProps<TModel>
) =>
{
    const { renderRowDetail } = useGridContext();
    const columns = props.columns.flatMap(c =>
        c.type === 'group' ? c.subColumns : c
    );
    const uid = props.data.rowNumber;

    return (
        <tr data-test="data-row" className="data-row">
            {renderRowDetail && (
                <RowDetailTemplateTriggerCell
                    rowId={props.data.rowId}
                    isShowing={props.data.showDetail}
                />
            )}
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
