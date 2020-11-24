import {useGridContext} from "../context";
import {useState} from "react";
import {cloneData} from "../util";
import {Column, Direction} from "../types";
import * as React from "react";
import {IRowProps} from "./types";
import {CellInlineEdit} from "./cell-inline-edit";
import {ActionCell} from "./cell-action";

export const RowInlineEdit = <TModel extends object>(props: IRowProps<TModel>) => {
    const {editingContext} = useGridContext();
    const [rowData, setRowData] = useState(props.data);

    if (!editingContext) {
        throw new Error('RowInlineEdit can not be used with a not editable grid');
    }

    const columns = props.columns.flatMap(c => c.type === 'group' ? c.subColumns : c);
    const uid = props.data.rowId;

    const startEditing = (field: string) =>
    {
        console.log(`editing ${field}`);

        editingContext.setEditField({ rowId: props.data.rowId, field: field});
        setRowData(cloneData(props.data));
    }

    const onChange = (model: TModel) =>
    {
        if(!editingContext.editField)
        {
            throw new Error('on change fired without an edit field set');
        }
        const hasChanges = (model as any)[editingContext.editField.field] !== (rowData.model as any)[editingContext.editField.field];
        setRowData({ rowId: props.data.rowId, model, dirty: rowData.dirty||hasChanges })
    }

    const doneEditing = (commitChanges: boolean, advance: Direction ) => {
        console.log(`    done editing ${editingContext.editField?.field}: dirty=${rowData.dirty} commit=${commitChanges}`);

        if(!editingContext.editField)
        {
            throw new Error('doneEditing called but now editField in context');
        }

        const wasEditingField = editingContext.editField;

        editingContext.setEditField(null);

        if(commitChanges && rowData.dirty)
        {
            editingContext.updateRow(rowData);
        }
        else
        {
            setRowData(props.data);
        }

        if(advance !== 'none')
        {
            const currentIndex = columns.findIndex(c => {
                if(!c || c.type !== 'data')
                {
                    return false;
                }
                return c.field === wasEditingField?.field;
            });

            if(currentIndex < 0)
            {
                throw new Error('could not find the field that was just being edited');
            }

            let nextField: Column<TModel>|undefined;
            const searchIncrement = advance === 'forward' ? 1 : -1;
            for(let i=currentIndex+searchIncrement; i < columns.length && i >= 0; i+= searchIncrement)
            {
                const c = columns[i];
                if(colIsEditable(c))
                {
                    nextField = c;
                    break;
                }
            }
            if(nextField?.type === 'data' && nextField?.field)
            {
                startEditing(nextField.field);
            }
            else
            {
                nextField = columns.find(c => !(!c || c.type !== 'data' || c.hidden || !c.editable || !c.field));
                if(nextField?.type === 'data' && nextField?.field)
                {
                    editingContext.setEditField({ field: nextField.field, rowId: wasEditingField?.rowId + searchIncrement});
                }
            }
        }
    };

    const classes: string[] = [];
    if(rowData.dirty) classes.push('modified');
    if(editingContext.editField) classes.push('edit-row');

    return (
        <tr className={classes.join('-')} data-test="data-row">
            {columns.map(c => {
                if (c?.type === 'data') {
                    return <CellInlineEdit
                        key={`td-${uid}-${c.name}`}
                        column={c}
                        data={rowData}
                        isEditing={editingContext?.editField?.field === c.field && editingContext?.editField?.rowId === props.data.rowId}
                        startEditing={startEditing}
                        doneEditing={doneEditing}
                        onChange={onChange}
                    />;
                }
                if (c?.type === 'action') {
                    return <ActionCell key={`td-${uid}-${c.name}`} column={c} data={props.data}/>;
                }
                throw new Error('unexpected cell type');
            })
            }
        </tr>
    );
};

const colIsEditable = <TModel extends object>(c: Column<TModel>|undefined) => !(!c || c.type !== 'data' || c.hidden || !c.editable || !c.field);
