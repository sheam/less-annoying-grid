import * as React from 'react';
import { ChangeEvent, KeyboardEvent } from 'react';
import { ColumnEditorType, Direction } from '../types';

interface IFieldEditorProps {
    model: any;
    field: string;
    editorType: ColumnEditorType;
    editComplete: (commitChanges: boolean, advance: Direction) => void;
    onChange: (model: any) => void;
}

export const FieldEditor: React.FunctionComponent<IFieldEditorProps> = ({
    model,
    field,
    editorType,
    editComplete,
    onChange,
}) => {
    const inputType =
        editorType.type === 'values' ? editorType.subType : editorType.type;
    const changeHandler = (
        e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>
    ) => {
        (model as any)[field] = coerceValueType(e.target.value, inputType);
        onChange(model);
    };

    const focusLost = () => {
        editComplete(true, Direction.none);
    };

    const detectSpecialKeys = (
        e: KeyboardEvent<HTMLInputElement> | KeyboardEvent<HTMLSelectElement>
    ) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            editComplete(false, Direction.none);
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            editComplete(true, Direction.none);
        }
        if (e.key === 'Tab') {
            e.preventDefault();
            editComplete(
                true,
                e.shiftKey ? Direction.backward : Direction.forward
            );
        }
    };

    const stringFieldValue = (model as any)[field]?.toString() || '';

    if (editorType.type === 'text') {
        return (
            <input
                name={field}
                type="text"
                value={stringFieldValue}
                maxLength={editorType.maxLength}
                autoFocus={true}
                onKeyDown={detectSpecialKeys}
                onChange={changeHandler}
                onBlur={focusLost}
            />
        );
    }
    if (editorType.type === 'number') {
        return (
            <input
                name={field}
                type="number"
                min={editorType.min}
                max={editorType.max}
                step={editorType.step}
                value={stringFieldValue}
                autoFocus={true}
                onKeyDown={detectSpecialKeys}
                onChange={changeHandler}
                onBlur={focusLost}
            />
        );
    }
    if (editorType.type === 'date') {
        return (
            <input
                name={field}
                type="date"
                min={editorType.startRange?.toString()}
                max={editorType.endRange?.toString()}
                value={stringFieldValue}
                autoFocus={true}
                onKeyDown={detectSpecialKeys}
                onChange={changeHandler}
                onBlur={focusLost}
            />
        );
    }
    if (editorType.type === 'values') {
        return (
            <select
                name={field}
                value={stringFieldValue}
                autoFocus={true}
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

function coerceValueType(value: string, inputType: InputType): any {
    if (inputType === 'text' || inputType === undefined) {
        return value;
    }

    if (!value) {
        return null;
    }

    if (inputType === 'date') {
        return new Date(value);
    }

    if (inputType === 'number') {
        if (value.indexOf('.') < 0) {
            return parseInt(value, 10) || null;
        }
        return parseFloat(value) || null;
    }

    throw new Error(`unhandled input type ${inputType}`);
}
