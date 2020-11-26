import { FieldEditor } from './field-editor';
import { cloneData } from '../util';
import * as React from 'react';
import { Direction, IRowData } from '../types-grid';
import { ValidationError } from './validation-error';
import { IDataColumn } from '../columns/types';

interface ICellInlineEditProps<TModel extends object> {
    isEditing: boolean;
    startEditing: (field: string) => void;
    onChange: (model: TModel) => void;
    doneEditing: (commitChanges: boolean, advance: Direction) => void;
    column: IDataColumn<TModel>;
    data: IRowData<TModel>;
}

export const CellInlineEdit = <TModel extends object>({
    column: { field, hidden, renderDisplay, editable },
    data,
    isEditing,
    startEditing,
    onChange,
    doneEditing,
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
                <FieldEditor
                    model={cloneData(data.model)}
                    field={field}
                    editorType={editable}
                    onChange={onChange}
                    editComplete={doneEditing}
                />
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
