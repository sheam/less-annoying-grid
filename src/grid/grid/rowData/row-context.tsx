import * as React from 'react';
import { useContext } from 'react';
import { Direction } from '../types-grid';

export interface IRowContext
{
    model : any;
    onChange : (model : any) => void;
    doneEditing : (commitChanges : boolean, direction : Direction) => void;
}

export const RowContext = React.createContext<IRowContext>({} as any);

export const useRowContext = () => useContext<IRowContext>(RowContext);
