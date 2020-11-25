import { ICellProps } from './types';
import * as React from 'react';

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
