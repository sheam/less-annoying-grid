import * as React from 'react';
import { Column, ColumnEditorType, IDataColumn } from "../columns/types";
import { FieldEditor } from "./field-editor";
import { useGridContext } from "../context";
import { IRowContext, RowContext } from "./row-context";
import { SyncAction } from "../types-sync";

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
        return null;
    }

    const editableDataColumns = columns.filter(c => c.type === 'data' && c.editable) as Array<IDataColumn<TModel>>;

    const rowEditContext: IRowContext = {
        model: editField.rowData.model,
        doneEditing: (commit, _) => doneEditing(commit),
        onChange,
        focusField: editableDataColumns[0].field,
    };

    function doneEditing(commitChanges: boolean) { }

    function onChange(model: TModel)
    {
        console.log('model changed');
        rowEditContext.model = model;
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
    let count = 1;
    return (
        <>
            <h2>{isAdd ? 'Adding ' : 'Editing '} {modelTypeName || 'Item'}</h2>
            <div className='fields'>
                {columns.map(c =>
                {
                    const focus = count === 1;
                    count++;
                    return (
                        <div key={`${c.name}-editor`}>
                            <label>
                                {c.name}

                                {/* @ts-ignore: we know editable is defined because of filter */}
                                {getEditorElement(c.editable, c.field, focus)}
                            </label>
                        </div>
                    );
                })}
            </div>
            <div className='controls'>
                <button>
                    Cancel
                </button>
                <button>
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
