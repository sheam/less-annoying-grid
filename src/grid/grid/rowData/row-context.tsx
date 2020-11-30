import * as React from 'react';
import { useContext } from 'react';
import { Direction } from '../types-grid';

export interface IRowContext
{
    model: any;
    onChange: (model: any) => void;
    doneEditingField: (commitChanges: boolean, direction: Direction) => void;
    doneEditingModel?: (commitChanges: boolean, finalModel?: any) => void;
    focusField: string | null | undefined;
    isAdd: boolean;
}

export const RowContext = React.createContext<IRowContext>({} as any);

export const useRowContext = () => useContext<IRowContext>(RowContext);
