/* tslint:disable:interface-over-type-literal */
import * as React from 'react';
import {useContext} from 'react';
import {IFieldFilter, IPagination, ISortColumn} from './types';

export interface IGridContext
{
    pagination?: IPagination;
    setPagination?: (p: IPagination) => void;

    sort?: ISortColumn|null;
    setSort?: (s: ISortColumn|null) => void;

    filters?: IFieldFilter[];
    setFilters?: (fs: IFieldFilter[]) => void;

    transmitting?: boolean;
    setTransmitting?: (isLoading: boolean) => void;
}

export const GridContext = React.createContext<IGridContext>({});

export const useGridContext = () => useContext<IGridContext>(GridContext);
