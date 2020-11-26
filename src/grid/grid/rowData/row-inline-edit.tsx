import { useGridContext } from '../context';
import * as React from 'react';
import { useState } from 'react';
import { cloneData, getNewSyncAction, hasChanged } from '../util';
import { IRowProps } from './types';
import { CellInlineEdit } from './cell-inline-edit';
import { ActionCell } from './cell-action';
import { Column } from '../columns/types';
import { Direction } from '../types-grid';
import { SyncAction } from '../types-sync';

export const RowInlineEdit = <TModel extends object>(
    props: IRowProps<TModel>
) => {
    const { editingContext } = useGridContext();
    const [rowData, setRowData] = useState(props.data);

    if (!editingContext) {
        throw new Error(
            'RowInlineEdit can not be used with a not editable grid'
        );
    }

    const columns = props.columns.flatMap(c =>
        c.type === 'group' ? c.subColumns : c
    );
    const uid = props.data.rowNumber;

    const startEditing = (field: string) => {
        console.log(`editing ${field}`);

        editingContext.setEditField(field, props.data.rowNumber);
        setRowData(cloneData(props.data));
    };

    const onChange = (model: TModel) => {
        if (!editingContext.editField) {
            throw new Error('on change fired without an edit field set');
        }
        const hasChanges =
            (model as any)[editingContext.editField.field] !==
            (rowData.model as any)[editingContext.editField.field];
        const newSyncAction = hasChanges
            ? SyncAction.updated
            : SyncAction.unchanged;
        setRowData({
            rowNumber: props.data.rowNumber,
            rowId: props.data.rowId,
            model,
            syncAction: getNewSyncAction(props.data.syncAction, newSyncAction),
        });
    };

    const doneEditing = (commitChanges: boolean, advance: Direction) => {
        console.log(
            `    done editing ${editingContext.editField?.field}: syncAction=${rowData.syncAction} commit=${commitChanges}`
        );

        if (!editingContext.editField) {
            throw new Error('doneEditing called but now editField in context');
        }

        const wasEditingField = editingContext.editField;

        editingContext.setEditField(null, null);

        if (commitChanges && hasChanged(rowData)) {
            editingContext.updateRow(rowData);
        } else {
            setRowData(props.data);
        }

        if (advance !== Direction.none) {
            const currentIndex = columns.findIndex(c => {
                if (!c || c.type !== 'data') {
                    return false;
                }
                return c.field === wasEditingField?.field;
            });

            if (currentIndex < 0) {
                throw new Error(
                    'could not find the field that was just being edited'
                );
            }

            let nextField: Column<TModel> | undefined;
            const searchIncrement = advance === Direction.forward ? 1 : -1;
            for (
                let i = currentIndex + searchIncrement;
                i < columns.length && i >= 0;
                i += searchIncrement
            ) {
                const c = columns[i];
                if (colIsEditable(c)) {
                    nextField = c;
                    break;
                }
            }
            if (nextField?.type === 'data' && nextField?.field) {
                startEditing(nextField.field);
            } else {
                nextField = undefined;
                const startIndex =
                    advance === Direction.forward ? 0 : columns.length - 1;
                for (
                    let i = startIndex;
                    i < columns.length && i >= 0;
                    i += searchIncrement
                ) {
                    const c = columns[i];
                    if (colIsEditable(c)) {
                        nextField = c;
                        break;
                    }
                }
                if (nextField && nextField.type === 'data' && nextField.field) {
                    editingContext.setEditField(
                        nextField.field,
                        props.data.rowNumber + searchIncrement
                    );
                }
            }
        }
    };

    const classes = [rowData.syncAction.toString()];
    if (hasChanged(rowData)) classes.push('modified');
    if (editingContext.editField) classes.push('edit-row');

    return (
        <tr className={classes.join(' ')} data-test="data-row">
            {columns.map(c => {
                if (c?.type === 'data') {
                    return (
                        <CellInlineEdit
                            key={`td-${uid}-${c.name}`}
                            column={c}
                            data={rowData}
                            isEditing={
                                editingContext?.editField?.field === c.field &&
                                editingContext?.editField?.rowId ===
                                    props.data.rowId
                            }
                            startEditing={startEditing}
                            doneEditing={doneEditing}
                            onChange={onChange}
                        />
                    );
                }
                if (c?.type === 'action') {
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

const colIsEditable = <TModel extends object>(c: Column<TModel> | undefined) =>
    !(!c || c.type !== 'data' || c.hidden || !c.editable || !c.field);