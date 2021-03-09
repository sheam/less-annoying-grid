import * as React from 'react';
import { Column, ColumnEditorType, IDataColumn, IEditOnlyField } from "../columns/types";
import { FieldEditor } from "./field-editor";
import { useGridContext } from "../context";
import { IRowContext, RowContext, useRowContext } from "./row-context";
import { SyncAction } from "../types-sync";
import { useState } from "react";
import { ValidationError } from "./validation-error";
import { IRowData } from "../types-grid";
import { shallowClone } from "../util";

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

    const editableDataColumns = columns.filter(c => (c.type === 'data' || c.type === 'field') && c.editable) as Array<IDataColumn<TModel> | IEditOnlyField<TModel>>;
    const [rowData, setRowData] = useState<IRowData<TModel>>(editField.rowData as IRowData<TModel>);

    const rowEditContext: IRowContext<TModel> = {
        rowData: rowData,
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
            const result = context.editingContext.updateRow(rowData.rowId, rowData.model);
            setRowData(result as IRowData<TModel>);
        }
    }

    function onChange(changedModel: TModel)
    {
        const newRowData = shallowClone(rowData);
        newRowData.model = changedModel;
        setRowData(newRowData);
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
    columns: Array<IDataColumn<TModel> | IEditOnlyField<TModel>>;
    isAdd: boolean;
    modelTypeName?: string;
}

const PopupEditorGenerated = <TModel extends object>({ columns, isAdd, modelTypeName }: IPopupEditorGeneratedProps<TModel>) =>
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

    const hasValidationErrors = !!(context.rowData.validationErrors?.length);

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
                            <ValidationError field={c.field} validationErrors={context.rowData.validationErrors} />
                        </div>
                    );
                })}
            </div>
            <div className='controls'>
                <button onClick={cancel}>
                    Cancel
                </button>
                <button onClick={save} disabled={hasValidationErrors}>
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
