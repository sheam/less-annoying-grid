import * as React from 'react';
import {ChangeEvent, useState} from "react";

interface IFieldEditorProps
{
    model: any;
    field: string;
    inputType: InputType;
    editComplete: (model: any, hasChanged: boolean) => void;
}

type InputType = 'number'|'text'|'date'|undefined;

export const FieldEditor: React.FunctionComponent<IFieldEditorProps> = ({model, field, inputType, editComplete}) =>
{
    const [fieldValue, setFieldValue] = useState((model as any)[field].toString());
    const changeHandler = (e: ChangeEvent<HTMLInputElement>) => setFieldValue(e.target.value);
    const onDoneEditing = (e: ChangeEvent<HTMLInputElement>) => {
        console.log(`done editing ${field}`);
        const newVal = e.target.value;
        const oldVal = (model as any)[field].toString();
        const hasChanged = newVal !== oldVal;
        (model as any)[field] = coerceValueType(newVal, inputType);
        editComplete(model, hasChanged);
    }
    const stringFieldValue = fieldValue?.toString() || '';
    return (
        <input
            name={field}
            type={inputType}
            value={stringFieldValue}
            autoFocus={true}
            onChange={changeHandler}
            onBlur={onDoneEditing} />
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

