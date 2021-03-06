import * as React from 'react';
import { KeyboardEvent, useContext } from 'react';
import { Direction, IRowData } from '../types-grid';

export interface IRowContext<TSummaryModel extends object>
{
    rowData: IRowData<TSummaryModel>
    onChange: (model: any) => void;
    doneEditingField: (commitChanges: boolean, direction?: Direction) => void;
    doneEditingModel?: (commitChanges: boolean, finalModel?: any) => void;
    detectSpecialKeys?: (e: KeyboardEvent<HTMLInputElement> | KeyboardEvent<HTMLSelectElement> | KeyboardEvent<HTMLTextAreaElement>) => void;
    focusField?: string | null;
    isAdd: boolean;
}

export const RowContext = React.createContext({} as any);

export const useRowContext = <TSummaryModel extends object>() => useContext<IRowContext<TSummaryModel>>(RowContext);
