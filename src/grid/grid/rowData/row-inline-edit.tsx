import { useGridContext } from '../context';
import * as React from 'react';
import { KeyboardEvent, useState } from 'react';
import { cloneData, hasChanged } from '../util';
import { IRowProps } from './types';
import { CellInlineEdit } from './cell-inline-edit';
import { ActionCell } from './cell-action';
import { Direction } from '../types-grid';
import { SyncAction } from '../types-sync';
import { CellReadonly } from './cell-readonly';
import { IRowContext, RowContext } from './row-context';
import { RowDetailTemplateTriggerCell } from './detail-template';

export const RowInlineEdit = <TModel extends object>(
    props: IRowProps<TModel>
) =>
{
    const { editingContext, renderRowDetail } = useGridContext();
    const [rowData, setRowData] = useState(props.data);

    if (!editingContext)
    {
        throw new Error(
            'RowInlineEdit can not be used with a not editable grid'
        );
    }

    const columns = props.columns.flatMap(c =>
        c.type === 'group' ? c.subColumns : c
    );
    const uid = props.data.rowNumber;

    const startEditing = (field: string) =>
    {
        editingContext.setEditField(field, props.data);
        setRowData(cloneData(props.data));
    };

    const onChange = (model: TModel) =>
    {
        if (!editingContext.editField)
        {
            throw new Error('on change fired without an edit field set');
        }
        setRowData({
            rowNumber: props.data.rowNumber,
            rowId: props.data.rowId,
            model,
            validationErrors: rowData.validationErrors,
            syncAction: SyncAction.updated,
            showDetail: props.data.showDetail,
            originalModel: props.data.originalModel
        });
    };

    const doneEditing = (commitChanges: boolean, advance: Direction) =>
    {
        if (!editingContext.editField)
        {
            throw new Error('doneEditing called but now editField in context');
        }

        editingContext.setEditField(null, null);

        if (commitChanges && hasChanged(rowData))
        {
            editingContext.updateRow(rowData.rowId, rowData.model);
        } else
        {
            setRowData(props.data);
        }

        editingContext.advanceEditField(advance);
    };

    function detectSpecialKeys(
        e: KeyboardEvent<HTMLInputElement> | KeyboardEvent<HTMLSelectElement>
    )
    {
        if (e.key === 'Escape')
        {
            e.preventDefault();
            doneEditing(false, Direction.none);
        }
        if (e.key === 'Enter')
        {
            e.preventDefault();
            doneEditing(true, Direction.none);
        }
        if (e.key === 'Tab')
        {
            e.preventDefault();
            doneEditing(
                true,
                e.shiftKey ? Direction.backward : Direction.forward
            );
        }
    }

    const classes = [rowData.syncAction.toString(), 'data-row'];
    if (hasChanged(rowData)) classes.push('modified');
    if (editingContext.editField) classes.push('edit-row');

    const rowEditContext: IRowContext = {
        model: rowData.model,
        doneEditingField: doneEditing,
        onChange,
        isAdd: rowData.syncAction === SyncAction.added,
        detectSpecialKeys,
        focusField: editingContext.editField?.field,
    };

    return (
        <RowContext.Provider value={rowEditContext}>
            <tr className={classes.join(' ')} data-test="data-row">
                {renderRowDetail && (
                    <RowDetailTemplateTriggerCell
                        rowId={rowData.rowId}
                        isShowing={rowData.showDetail}
                    />
                )}
                {columns.map(c =>
                {
                    if (!c)
                    {
                        throw new Error('column should not be null');
                    }

                    if (c.type === 'data' && c.editable)
                    {
                        return (
                            <CellInlineEdit
                                key={`td-${uid}-${c.name}`}
                                column={c}
                                data={rowData}
                                isEditing={
                                    editingContext?.editField?.field === c.field &&
                                    editingContext?.editField?.rowData.rowId === props.data.rowId
                                }
                                startEditing={startEditing}
                            />
                        );
                    }
                    if (c.type === 'display' || c.type === 'data')
                    {
                        return (
                            <CellReadonly
                                key={`td-${uid}-${c.name}`}
                                data={rowData}
                                column={c}
                            />
                        );
                    }
                    if (c.type === 'action')
                    {
                        return (
                            <ActionCell
                                key={`td-${uid}-${c.name}`}
                                column={c}
                                rowData={props.data}
                            />
                        );
                    }
                    throw new Error(`unexpected cell type`);
                })}
            </tr>
        </RowContext.Provider>
    );
};
