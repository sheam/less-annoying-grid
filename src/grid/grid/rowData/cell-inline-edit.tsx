import { FieldEditor } from './field-editor';
import * as React from 'react';
import { IRowData } from '../types-grid';
import { ValidationError } from './validation-error';
import { ColumnEditorType, IDataColumn } from '../columns/types';

interface ICellInlineEditProps<TModel extends object> {
    isEditing: boolean;
    startEditing: (field: string) => void;
    column: IDataColumn<TModel>;
    data: IRowData<TModel>;
}

export const CellInlineEdit = <TModel extends object>({
    column: { field, hidden, renderDisplay, editable },
    data,
    isEditing,
    startEditing,
}: ICellInlineEditProps<TModel>) => {
    if (!field) {
        throw new Error('field not provided to editable cell');
    }

    if (isEditing) {
        if (!editable) {
            throw new Error(
                `column for field ${field} is being edited, but has not defined editor`
            );
        }

        return (
            <td hidden={hidden}>
                {getEditorElement(editable, field)}
                <ValidationError
                    field={field}
                    validationErrors={data.validationErrors}
                />
            </td>
        );
    } else {
        const clickHandler = editable ? () => startEditing(field) : undefined;
        return (
            <td hidden={hidden} onClick={clickHandler}>
                {renderDisplay && renderDisplay(data.model)}
                {!renderDisplay &&
                    field &&
                    (data.model as any)[field]?.toString()}
                <ValidationError
                    field={field}
                    validationErrors={data.validationErrors}
                />
            </td>
        );
    }
};

function getEditorElement(
    editor: ColumnEditorType,
    field: string
): JSX.Element {
    if (editor.type === 'custom') {
        return editor.editor;
    }
    return <FieldEditor field={field} editorType={editor} />;
}
