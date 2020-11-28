import * as React from 'react';
import { useState } from 'react';
import { Column, IDataColumn } from "../columns/types";
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
    if (!context.editingContext.editField)
    {
        return null;
    }

    const hide = !context.editingContext?.editField;

    function doneEditing(commitChanges: boolean)
    {
        // if (!context.editingContext) {
        //     throw new Error('editingContext must not be null');
        // }
        // if(!rowId)
        // {
        //     throw new Error('rowId not set');
        // }
        // if(!model)
        // {
        //     throw new Error('model is null');
        // }
        //
        // if (commitChanges) {
        //     context.editingContext.updateRow(rowId, model);
        // } else {
        //     context.editingContext.setEditField(null, null);
        // }
    }

    function onChange(model: TModel)
    {
        //setModel(model);
    }

    const rowEditContext: IRowContext = {
        // model: model,
        model: {} as any,
        doneEditing: (commit, _) => doneEditing(commit),
        onChange,
    };

    const dataColumns = columns.filter(c => c.type === 'data') as Array<IDataColumn<TModel>>;
    // const isAdd = rowData.syncAction === SyncAction.added;
    const isAdd = false;

    return (
        <RowContext.Provider value={rowEditContext}>
            <div className="popup-editor" hidden={hide}>
                {context.editingContext.modelEditor}
                {!context.editingContext.modelEditor &&
                    <PopupEditorGenerated
                        columns={dataColumns}
                        isAdd={isAdd}
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
    return (
        <>
            <h2>{isAdd ? 'Adding ' : 'Editing '} {modelTypeName || 'Item'}</h2>
            <div className='fields'>
                {columns.filter(c => c.editable).map(c =>
                {
                    return (
                        <label>
                            {c.name}

                            {/* @ts-ignore: we know editable is defined because of filter */}
                            <FieldEditor field={c.field} editorType={c.editable} />
                        </label>
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


