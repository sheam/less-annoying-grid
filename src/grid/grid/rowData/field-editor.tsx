import * as React from 'react';
import { ChangeEvent } from 'react';
import { ColumnEditorTypeBuiltIn } from '../columns/types';
import { Direction } from '../types-grid';
import { useRowContext } from './row-context';
import { cloneData } from '../util';

interface IFieldEditorProps
{
    field: string;
    editorType: ColumnEditorTypeBuiltIn;

}

export const FieldEditor: React.FunctionComponent<IFieldEditorProps> = ({
    field,
    editorType,
}) =>
{
    const context = useRowContext();
    const model = cloneData(context.rowData.model);
    const detectSpecialKeys = context.detectSpecialKeys;
    const focus = context.focusField === field;

    const inputType =
        editorType.type === 'values' ? editorType.subType : editorType.type;

    const changeHandler = (
        e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>
    ) =>
    {
        (model as any)[field] = coerceValueType(e.target.value, inputType);
        context.onChange(model);
    };

    const focusLost = () =>
    {
        context.doneEditingField(true, Direction.none);
    };

    const stringFieldValue = (model as any)[field]?.toString() || '';

    if (editorType.type === 'text')
    {
        return (
            <input
                name={field}
                type="text"
                value={stringFieldValue}
                maxLength={editorType.maxLength}
                autoFocus={focus}
                onKeyDown={detectSpecialKeys}
                onChange={changeHandler}
                onBlur={focusLost}
            />
        );
    }
    if (editorType.type === 'number')
    {
        return (
            <input
                name={field}
                type="number"
                min={editorType.min}
                max={editorType.max}
                step={editorType.step}
                value={stringFieldValue}
                autoFocus={focus}
                onKeyDown={detectSpecialKeys}
                onChange={changeHandler}
                onBlur={focusLost}
            />
        );
    }
    if (editorType.type === 'date')
    {
        return (
            <input
                name={field}
                type="date"
                min={editorType.startRange?.toString()}
                max={editorType.endRange?.toString()}
                value={stringFieldValue}
                autoFocus={focus}
                onKeyDown={detectSpecialKeys}
                onChange={changeHandler}
                onBlur={focusLost}
            />
        );
    }
    if (editorType.type === 'values')
    {
        return (
            <select
                name={field}
                value={stringFieldValue}
                autoFocus={focus}
                onKeyDown={detectSpecialKeys}
                onBlur={focusLost}
                onChange={changeHandler}
            >
                {editorType.values.map(({ text, value }, i) => (
                    <option key={i} value={value}>
                        {text}
                    </option>
                ))}
            </select>
        );
    }
    throw new Error('Unhandled editor type');
};

type InputType = 'number' | 'text' | 'date';

function coerceValueType(value: string, inputType: InputType): any
{
    if (inputType === 'text' || inputType === undefined)
    {
        return value;
    }

    if (!value)
    {
        return null;
    }

    if (inputType === 'date')
    {
        return new Date(value);
    }

    if (inputType === 'number')
    {
        if (value.indexOf('.') < 0)
        {
            return parseInt(value, 10) || null;
        }
        return parseFloat(value) || null;
    }

    throw new Error(`unhandled input type ${inputType}`);
}
