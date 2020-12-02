import * as React from 'react';
import { IValidationError } from '../types-grid';

interface IValidationErrorProps
{
    field: string;
    validationErrors: IValidationError[] | undefined | null;
}

export const ValidationError: React.FunctionComponent<IValidationErrorProps> = ({
    field,
    validationErrors,
}) =>
{
    if (!validationErrors?.length)
    {
        return null;
    }
    const errorsForField = validationErrors
        .filter(e => e.field === field)
        .map(e => e.error);
    if (errorsForField.length === 0)
    {
        return null;
    }

    const message = errorsForField.join(', ');
    return <div className="validation-error">{message}</div>;
};
