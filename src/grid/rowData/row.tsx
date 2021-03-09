import { useGridContext } from '../context';
import * as React from 'react';
import { IRowProps } from './types';
import { RowReadOnly } from './row-readonly';
import { RowInlineEdit } from './row-inline-edit';
import { GridEditMode } from '../types-grid';
import { SyncAction } from '../types-sync';
import { RowDetailTemplate } from './detail-template';
import { getNonGroupColumns } from '../util';

export const Row = <TSummaryModel extends object>(props: IRowProps<TSummaryModel>) =>
{
    const { editingContext, renderRowDetail } = useGridContext();
    if (props.data.syncAction === SyncAction.deleted)
    {
        return null;
    }

    let row: JSX.Element | null = null;
    if (!editingContext || editingContext.editMode === GridEditMode.external)
    {
        row = <RowReadOnly {...props} />;
    } else if (editingContext.editMode === GridEditMode.inline)
    {
        row = <RowInlineEdit {...props} />;
    }

    if (!row)
    {
        throw new Error('unhandled edit mode');
    }

    if (renderRowDetail)
    {
        return (
            <>
                {row}
                <RowDetailTemplate
                    data={props.data}
                    numColumns={getNonGroupColumns(props.columns).length}
                />
            </>
        );
    } else
    {
        return row;
    }
};
