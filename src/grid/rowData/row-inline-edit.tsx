import { useGridContext } from '../context';
import * as React from 'react';
import { KeyboardEvent, useCallback, useState } from 'react';
import { hasChanged, shallowClone } from '../util';
import { IRowProps } from './types';
import { CellInlineEdit } from './cell-inline-edit';
import { ActionCell } from './cell-action';
import { Direction } from '../types-grid';
import { SyncAction } from '../types-sync';
import { CellReadonly } from './cell-readonly';
import { IRowContext, RowContext } from './row-context';
import { RowDetailTemplateTriggerCell } from './detail-template';

export const RowInlineEdit = <TSummaryModel extends object>(
    props: IRowProps<TSummaryModel>
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

    // if (rowData.rowNumber === 1)
    // {
    //     console.log(`>>> Row Data [${rowData.rowNumber}]: ${(rowData.model as any).MaterialName} rowId=${rowData.rowId}`);
    // }

    const columns = props.columns
        .filter(c => c.type !== 'field')
        .flatMap(c =>
            c.type === 'group' ? c.subColumns : c
        );
    const uid = props.data.rowNumber;

    const startEditing = useCallback((field: string) =>
    {
        // if (rowData.rowNumber === 1)
        // {
        //     console.log(`>>> Start -> Row Data [${rowData.rowNumber}]: ${(rowData.model as any).MaterialName} rowId=${rowData.rowId}`);
        // }
        if (!editingContext)
        {
            throw new Error(
                'RowInlineEdit can not be used with a not editable grid'
            );
        }
        editingContext.setEditField(field, props.data);
        setRowData(shallowClone(props.data));
    }, [editingContext, rowData]);

    const onChange = useCallback((model: TSummaryModel) =>
    {
        // if (rowData.rowNumber === 1)
        // {
        //     console.log(`>>> Change -> Row Data [${rowData.rowNumber}]: ${(model as any).MaterialName} rowId=${rowData.rowId}`);
        // }
        if (!editingContext?.editField)
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
    }, [rowData, editingContext]);

    const doneEditing = useCallback((commitChanges: boolean, advance?: Direction) =>
    {
        // if (rowData.rowNumber === 1)
        // {
        //     console.log(`>>> Done -> Row Data [${rowData.rowNumber}]: ${(rowData.model as any).MaterialName} rowId=${rowData.rowId}`);
        // }
        if (!editingContext?.editField)
        {
            throw new Error('doneEditing called but now editField in context');
        }

        if (commitChanges && hasChanged(rowData))
        {
            editingContext.updateRow(rowData.rowId, rowData.model);
        } else
        {
            setRowData(props.data);
        }

        editingContext.setEditField(null, null);

        if (advance)
        {
            editingContext.advanceEditField(advance);
        }
    }, [editingContext, rowData]);

    const detectSpecialKeys = useCallback((
        e: KeyboardEvent<HTMLInputElement> | KeyboardEvent<HTMLSelectElement>
    ) =>
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
    }, [doneEditing]);

    const classes = [rowData.syncAction.toString(), 'data-row'];
    if (hasChanged(rowData)) classes.push('modified');
    if (editingContext.editField) classes.push('edit-row');

    const rowEditContext: IRowContext<TSummaryModel> = {
        rowData,
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
                        const isEditing = editingContext?.editField?.field === c.field &&
                            editingContext?.editField?.rowData.rowId === props.data.rowId;
                        // const isEditing = props.data.rowNumber === 1;
                        return (
                            <CellInlineEdit
                                key={`td-${uid}-${c.name}`}
                                column={c}
                                data={rowData}
                                isEditing={isEditing}
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
                    throw new Error(`Unexpected cell type for Inline Editing: '${c.type}' for column ${c.name}`);
                })}
            </tr>
        </RowContext.Provider>
    );
};
