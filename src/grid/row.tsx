/* tslint:disable:jsx-no-multiline-js jsx-no-lambda */
import * as React from 'react';
import {Column, Direction, IActionColumn, IColumn, IRowData} from './types';
import {FieldEditor} from "./field-editor";
import {useGridContext} from "./context";
import {useState} from "react";
import {cloneData} from "./util";

export interface IRowProps<TModel extends object> {
    columns: Column<TModel>[];
    data: IRowData;
}

export const Row = <TModel extends object>(props: IRowProps<TModel>) => {
    const {editingContext} = useGridContext();
    if (!editingContext) {
        return <RowReadOnly {...props} />;
    }

    if (editingContext.editMode === "inline") {
        return <RowInlineEdit {...props} />
    }

    throw new Error('unhandled edit mode');
};

export const RowInlineEdit = <TModel extends object>(props: IRowProps<TModel>) => {
    const {editingContext} = useGridContext();
    const [editField, setEditField] = useState<string|null>(null);
    const [rowData, setRowData] = useState(props.data);

    if (!editingContext) {
        throw new Error('RowInlineEdit can not be used with a not editable grid');
    }

    const columns = props.columns.flatMap(c => c.type === 'group' ? c.subColumns : c);
    const uid = props.data.uid;

    const startEditing = (field: string) =>
    {
        console.log(`editing ${field}`);

        editingContext.setIsEditing(true);
        editingContext.setEditRowId(props.data.uid)
        setEditField(field);
        setRowData(cloneData(props.data));
    }

    const onChange = (model: TModel) =>
    {
        if(!editField)
        {
            throw new Error('on change fired without an edit field set');
        }
        const hasChanges = (model as any)[editField] !== (rowData.model as any)[editField];
        setRowData({ uid: props.data.uid, model, dirty: rowData.dirty||hasChanges })
    }

    const doneEditing = (commitChanges: boolean, advance: Direction ) => {
        console.log(`    done editing ${editField}: dirty=${rowData.dirty} commit=${commitChanges}`);

        const wasEditingField = editField;

        editingContext.setIsEditing(false);
        editingContext.setEditRowId(null)
        setEditField(null);

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
                return c.field === wasEditingField;
            });
            if(currentIndex < 0)
            {
                throw new Error('could not find the field that was just being edited');
            }
            const searchOffset = advance === 'forward' ? 1 : -1;
            const nextField = columns.slice(currentIndex+searchOffset).find(c => !(!c || c.type !== 'data' || c.hidden || !c.editable || !c.field));
            if(nextField?.type === 'data' && nextField.field)
            {
                startEditing(nextField.field);
            }
        }
    };

    const classes: string[] = [];
    if(rowData.dirty) classes.push('modified');
    if(editField) classes.push('edit-row');

    return (
        <tr className={classes.join('-')}>
            {columns.map(c => {
                if (c?.type === 'data') {
                    return <CellInlineEdit
                        key={`td-${uid}-${c.name}`}
                        column={c}
                        data={rowData}
                        isEditing={editField === c.field && props.data.uid === editingContext.editRowId}
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

interface ICellProps<TModel extends object> {
    column: IColumn<TModel>;
    data: IRowData;
}

interface ICellInlineEditProps<TModel extends object> {
    isEditing: boolean;
    startEditing: (field: string) => void;
    onChange: (model: TModel) => void;
    doneEditing: (commitChanges: boolean, advance: Direction) => void;
}

export const CellInlineEdit = <TModel extends object>(
    {
        column: {
            field,
            hidden,
            renderDisplay,
            editable
        },
        data,
        isEditing,
        startEditing,
        onChange,
        doneEditing,
    }: ICellProps<TModel> & ICellInlineEditProps<TModel>) =>
{
    if(!field)
    {
        throw new Error('field not provided to editable cell');
    }

    if (isEditing)
    {
        return (
            <td hidden={hidden}>
                <FieldEditor model={cloneData(data.model)} field={field} inputType={editable} onChange={onChange} editComplete={doneEditing}/>
            </td>
        );
    }
    else
    {
        const clickHandler = editable ? () => startEditing(field) : undefined;
        return (
            <td hidden={hidden} onClick={clickHandler}>
                {renderDisplay && renderDisplay(data.model)}
                {!renderDisplay && field && (data.model as any)[field].toString()}
            </td>
        );
    }
};

export const RowReadOnly = <TModel extends object>(props: IRowProps<TModel>) => {
    const columns = props.columns.flatMap(c => c.type === 'group' ? c.subColumns : c);
    const uid = props.data.uid;

    return (
        <tr>
            {columns.map(c => {
                if (c?.type === 'data') {
                    return <CellReadonly key={`td-${uid}-${c.name}`} column={c} data={props.data}/>;
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

export const CellReadonly = <TModel extends object>({column: {field, hidden, renderDisplay, editable}, data}: ICellProps<TModel>) => {
    return (
        <td hidden={hidden}>
            {renderDisplay && renderDisplay(data.model)}
            {!renderDisplay && field && (data.model as any)[field].toString()}
        </td>
    );
};

interface IActionCellProps<TModel extends object> {
    column: IActionColumn<TModel>;
    data: IRowData;
}

export const ActionCell = <TModel extends object>({column, data}: IActionCellProps<TModel>) => {
    return (
        <td hidden={column.hidden}>
            {column.actions.map(a =>
                <button
                    className={`action-${a.name}`}
                    key={`action-${a.name}`}
                    onClick={() => a.handler(data.model, data.uid, data.dirty)}
                >
                    {a.buttonContent}
                </button>)}
        </td>
    );
};
