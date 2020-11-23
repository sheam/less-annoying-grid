/* tslint:disable:jsx-no-multiline-js jsx-no-lambda */
import * as React from 'react';
import {Column, IActionColumn, IColumn, IRowData} from './types';
import {FieldEditor} from "./field-editor";
import {useGridContext} from "./context";
import {useState} from "react";

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
    if (!editingContext) {
        throw new Error('RowInlineEdit can not be used with a not editable grid');
    }

    const columns = props.columns.flatMap(c => c.type === 'group' ? c.subColumns : c);
    const uid = props.data.uid;

    const setEditing = (field: string, isEditing: boolean, hasChanged: boolean) => {
        console.log(`editing ${field}? ${isEditing?'yes':'no'}`);

        editingContext.setIsEditing(isEditing);
        editingContext.setNeedsSave(editingContext.needsSave||hasChanged)
        editingContext.setEditRowId(isEditing ? props.data.uid : null)
        setEditField(isEditing ? field : null);
    };

    return (
        <tr>
            {columns.map(c => {
                if (c?.type === 'data') {
                    return <CellInlineEdit
                        key={`td-${uid}-${c.name}`}
                        column={c}
                        data={props.data}
                        isEditing={editField === c.field && props.data.uid === editingContext.editRowId}
                        setIsEditing={setEditing}
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

interface ICellInlineEditProps {
    isEditing: boolean;
    setIsEditing: (field: string, isEditing: boolean, hasChanged: boolean) => void;
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
        setIsEditing
    }: ICellProps<TModel> & ICellInlineEditProps) =>
{
    if(!field)
    {
        throw new Error('field not provided to editable cell');
    }

    if (isEditing)
    {
        const doneEditing = (model: any, hasChanged: boolean) =>
        {
            setIsEditing(field, false, hasChanged);
        };
        return (
            <td hidden={hidden}>
                <FieldEditor model={data.model} field={field} inputType={editable} editComplete={doneEditing}/>
            </td>
        );
    }
    else
    {
        const clickHandler = editable ? () => setIsEditing(field, true, false) : undefined;
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
