import { IValidationError } from '../types-grid';
import { fdate } from '../util';
import { Column, IDataColumn } from './types';

export type Validator = (val: any) => ErrorMessage;
export type AggregateValidator = (
    model: any,
    field: string
) => IValidationError[];

export function validateModel<TModel extends object>(
    model: any,
    columns: Array<Column<TModel>>
): IValidationError[] {
    const result = new Array<IValidationError>();
    const dataColumns = columns.filter(
        c => c.type === 'data' && c.validator
    ) as IDataColumn<TModel>[];
    for (let c of dataColumns) {
        if (!c.validator) {
            continue;
        }
        const errors = c.validator(model, c.field);
        if (errors?.length > 0) {
            result.push(...errors);
        }
    }

    return result;
}

export function validator(...validators: Validator[]): AggregateValidator {
    return (model: any, field: string) => {
        const val = model[field];
        const errors = validateValue(val, ...validators);
        return errors.map(error => {
            return { field, error };
        });
    };
}

function validateValue(val: any, ...validators: Validator[]): string[] {
    const result = new Array<string>();
    for (let validator of validators) {
        const error = validator(val);
        if (error) {
            result.push(error);
        }
    }
    return result;
}

export function min(min: number): Validator {
    if (!hasValue(min)) {
        throw new Error('a min value must be provided for min validator');
    }
    return (num: number): ErrorMessage => {
        if (!hasValue(num)) {
            return null;
        }
        if (num < min) {
            return `min ${min}`;
        }
        return null;
    };
}

export function max(max: number): Validator {
    if (!hasValue(max)) {
        throw new Error('a max value must be provided for max validator');
    }
    return (num: number): ErrorMessage => {
        if (!hasValue(num)) {
            return null;
        }
        if (num > max) {
            return `max ${max}`;
        }
        return null;
    };
}

export function required(): Validator {
    return (val: any): ErrorMessage => {
        if (hasValue(val)) {
            return null;
        }
        return 'required';
    };
}

export function before(maxDate: Date): Validator {
    if (!hasValue(maxDate)) {
        throw new Error(
            'a maxDate value must be provided for before validator'
        );
    }
    return (date: Date): ErrorMessage => {
        if (!hasValue(date)) {
            return null;
        }
        if (date > maxDate) {
            return `max ${fdate(maxDate)}`;
        }
        return null;
    };
}

export function after(minDate: Date): Validator {
    if (!hasValue(minDate)) {
        throw new Error('a minDate value must be provided for after validator');
    }
    return (date: Date): ErrorMessage => {
        if (!hasValue(date)) {
            return null;
        }
        if (date < minDate) {
            return `min ${fdate(minDate)}`;
        }
        return null;
    };
}

export function maxLen(max: number): Validator {
    if (!hasValue(max)) {
        throw new Error('a max value must be provided for maxLen validator');
    }
    return (text: string): ErrorMessage => {
        if (!hasValue(text)) {
            return null;
        }
        if (text.length > max) {
            return `max length ${max}`;
        }
        return null;
    };
}

export function minLen(min: number): Validator {
    if (!hasValue(min)) {
        throw new Error('a min value must be provided for minLen validator');
    }
    return (text: string): ErrorMessage => {
        if (!hasValue(text)) {
            return null;
        }
        if (text.length < min) {
            return `min length ${min}`;
        }
        return null;
    };
}

function hasValue(v: any): boolean {
    return v !== null && v !== undefined;
}

type ErrorMessage = string | null;
