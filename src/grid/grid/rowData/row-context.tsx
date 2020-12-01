import * as React from 'react';
import { KeyboardEvent, useContext } from 'react';
import { Direction, IValidationError } from '../types-grid';

export interface IRowContext//<TModel extends object>
{
    // rowData: IRowData<TModel>
    model: any;
    onChange: (model: any) => void;
    doneEditingField: (commitChanges: boolean, direction: Direction) => void;
    doneEditingModel?: (commitChanges: boolean, finalModel?: any) => void;
    detectSpecialKeys?: (e: KeyboardEvent<HTMLInputElement> | KeyboardEvent<HTMLSelectElement>) => void;
    focusField?: string | null;
    isAdd: boolean;
}

export const RowContext = React.createContext<IRowContext>({} as any);

export const useRowContext = () => useContext<IRowContext>(RowContext);
