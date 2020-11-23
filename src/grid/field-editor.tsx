import * as React from 'react';
import {ChangeEvent, KeyboardEvent} from "react";
import {Direction} from "./types";

interface IFieldEditorProps
{
    model: any;
    field: string;
    inputType: InputType;
    editComplete: (commitChanges: boolean, advance: Direction) => void;
    onChange: (model: any) => void;
}

type InputType = 'number'|'text'|'date'|undefined;

export const FieldEditor: React.FunctionComponent<IFieldEditorProps> = ({model, field, inputType, editComplete, onChange}) =>
{
    const changeHandler = (e: ChangeEvent<HTMLInputElement>) =>
    {
        (model as any)[field] = coerceValueType(e.target.value, inputType);
        (model as any)['four'] = 'changed';
        onChange(model);
    };

    const focusLost = (_: ChangeEvent<HTMLInputElement>) =>
    {
        editComplete(true, 'none');
    };

    const detectSpecialKeys = (e: KeyboardEvent<HTMLInputElement>) =>
    {
        if(e.key === 'Escape')
        {
            e.preventDefault();
            editComplete(false, 'none');
        }
        if(e.key === 'Enter')
        {
            e.preventDefault();
            editComplete(true, 'none');
        }
        if(e.key === 'Tab')
        {
            e.preventDefault();
            editComplete(true,  e.shiftKey ? 'backward' : 'forward');
        }
    };

    const stringFieldValue = (model as any)[field]?.toString() || '';
    return (
        <input
            name={field}
            type={inputType}
            value={stringFieldValue}
            autoFocus={true}
            onKeyDown={detectSpecialKeys}
            onChange={changeHandler}
            onBlur={focusLost} />
    );
};

function coerceValueType(value: string, inputType: InputType): any
{
    if(inputType === "text" || inputType === undefined)
    {
        return value;
    }

    if(!value)
    {
        return null;
    }

    if(inputType === "date")
    {
        return new Date(value);
    }

    if(inputType === "number")
    {
        if(value.indexOf('.') < 0)
        {
            return parseInt(value, 10) || null;
        }
        return parseFloat(value) || null;
    }

    throw new Error(`unhandled input type ${inputType}`);
}

