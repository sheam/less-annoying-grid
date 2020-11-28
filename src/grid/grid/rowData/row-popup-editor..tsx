import * as React from 'react';
import { useRowContext } from "./row-context";
import { IDataColumn } from "../columns/types";
import { FieldEditor } from "./field-editor";
import { Direction } from "../types-grid";

interface IPopupEditorProps<TModel extends object>
{
    columns: Array<IDataColumn<TModel>>;
}

export const PopupEditor = <TModel extends object>({ columns }: IPopupEditorProps<TModel>) =>
{
    const context = useRowContext();

    function saveClicked()
    {
        context.doneEditing(true, Direction.none);
    }

    //TODO: will need to modify the field editor in order to work here
    return (
        <div className="popup-editor">
            <div className="fields">
                {columns.filter(c => c.editable).map(c =>
                {
                    return (
                        <div>
                            {/* @ts-ignore: we know that editable is not null because of the filter */}
                            <FieldEditor field={c.field} editorType={c.editable.type} />
                        </div>
                    );
                })}
            </div>
            <div className="controls">
                <button className="cancel">Cancel</button>
                <button className="save">Save</button>
            </div>
        </div>
    );
};
