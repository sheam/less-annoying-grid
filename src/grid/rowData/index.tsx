import { useGridContext } from '../grid/context';
import * as React from 'react';
import { IRowProps } from './types';
import { RowReadOnly } from './row-readonly';
import { RowInlineEdit } from './row-inline-edit';
import { SyncAction } from '../grid/sync';
import { GridEditMode } from '../grid/types';

export const Row = <TModel extends object>(props: IRowProps<TModel>) => {
    const { editingContext } = useGridContext();
    if (props.data.syncAction === SyncAction.deleted) {
        return null;
    }

    if (!editingContext) {
        return <RowReadOnly {...props} />;
    }

    if (editingContext.editMode === GridEditMode.inline) {
        return <RowInlineEdit {...props} />;
    }

    throw new Error('unhandled edit mode');
};
