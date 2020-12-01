import * as React from 'react';
import { KeyboardEvent, useContext } from 'react';
import { Direction, IRowData } from '../types-grid';

export interface IRowContext<TModel extends object>
{
    rowData: IRowData<TModel>
    onChange: (model: any) => void;
    doneEditingField: (commitChanges: boolean, direction?: Direction) => void;
    doneEditingModel?: (commitChanges: boolean, finalModel?: any) => void;
    detectSpecialKeys?: (e: KeyboardEvent<HTMLInputElement> | KeyboardEvent<HTMLSelectElement>) => void;
    focusField?: string | null;
    isAdd: boolean;
}

export const RowContext = React.createContext({} as any);

export const useRowContext = <TModel extends object>() => useContext<IRowContext<TModel>>(RowContext);
