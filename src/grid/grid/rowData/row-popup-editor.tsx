import * as React from 'react';
import { Column, ColumnEditorType, IDataColumn } from "../columns/types";
import { FieldEditor } from "./field-editor";
import { useGridContext } from "../context";
import { IRowContext, RowContext, useRowContext } from "./row-context";
import { SyncAction } from "../types-sync";
import { useState } from "react";
import { ValidationError } from "./validation-error";

interface IPopupEditorProps<TModel extends object>
{
    columns: Array<Column<TModel>>;
}

export const PopupEditor = <TModel extends object>({ columns }: IPopupEditorProps<TModel>) =>
{
    const context = useGridContext();
    if (!context.editingContext)
    {
        throw new Error('Do not render PopupEditor if grid is not editable');
    }
    const editField = context.editingContext?.editField;
    if (!editField)
    {
        throw new Error('edit field not defined');
    }

    const editableDataColumns = columns.filter(c => c.type === 'data' && c.editable) as Array<IDataColumn<TModel>>;
    const [model, setModel] = useState(editField.rowData.model);

    const rowEditContext: IRowContext = {
        model: model,
        doneEditingField: (commit, _) => doneEditingField(commit),
        doneEditingModel: (commit, finalModel) => complete(commit, finalModel),
        onChange,
        isAdd: editField.rowData.syncAction === SyncAction.added,
    };

    function doneEditingField(commitChanges: boolean)
    {
        if (!context.editingContext || !editField)
        {
            throw new Error('edit context must be defined.');
        }

        if (commitChanges)
        {
            context.editingContext.updateRow(editField.rowData.rowId, model);
        }
    }

    function onChange(changedModel: TModel)
    {
        setModel(changedModel);
    }

    function complete(saveChanges: boolean, finalModel?: TModel)
    {
        if (!context.editingContext || !editField)
        {
            throw new Error('edit context must be defined.');
        }

        if (saveChanges)
        {
            if (finalModel)
            {
                context.editingContext.updateRow(editField.rowData.rowId, finalModel);
            }
        }
        else
        {
            context.editingContext.revertRow(editField.rowData.rowId);
        }

        context.editingContext.setEditField(null, null);
    }

    return (
        <RowContext.Provider value={rowEditContext}>
            <div className="popup-editor">
                {context.editingContext.modelEditor}
                {!context.editingContext.modelEditor &&
                    <PopupEditorGenerated
                        columns={editableDataColumns}
                        isAdd={editField.rowData.syncAction === SyncAction.added}
                        modelTypeName={context.editingContext.modelTypeName || 'item'}
                    />
                }
            </div>
        </RowContext.Provider>
    );
};

interface IPopupEditorGeneratedProps<TModel extends object>
{
    columns: Array<IDataColumn<TModel>>;
    isAdd: boolean;
    modelTypeName?: string;
}

export const PopupEditorGenerated = <TModel extends object>({ columns, isAdd, modelTypeName }: IPopupEditorGeneratedProps<TModel>) =>
{
    const context = useRowContext();

    function cancel()
    {
        if (!context?.doneEditingModel)
        {
            throw new Error('RowContext must be defined');
        }

        context.doneEditingModel(false);
    }

    function save()
    {
        if (!context?.doneEditingModel)
        {
            throw new Error('RowContext must be defined');
        }

        context.doneEditingModel(true);
    }

    return (
        <>
            <h2>{isAdd ? 'Adding ' : 'Editing '} {modelTypeName || 'Item'}</h2>
            <div className='fields'>
                {columns.map(c =>
                {
                    return (
                        <div key={`${c.name}-editor`}>
                            <label>
                                {c.name}

                                {/* @ts-ignore: we know editable is defined because of filter */}
                                {getEditorElement(c.editable, c.field)}
                            </label>
                            {/*<ValidationError field={c.field} validationErrors={context.}*/}
                        </div>
                    );
                })}
            </div>
            <div className='controls'>
                <button onClick={cancel}>
                    Cancel
                </button>
                <button onClick={save}>
                    {isAdd ? 'Add' : 'Update'}
                </button>
            </div>
        </>
    );
};

function getEditorElement(
    editor: ColumnEditorType,
    field: string
): JSX.Element
{
    if (editor.type === 'custom')
    {
        return editor.editor;
    }
    return <FieldEditor field={field} editorType={editor} />;
}
