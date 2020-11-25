import * as React from 'react';
import { useContext } from 'react';
import { IGridProps, Setter } from './types-grid';
import { IGridState } from './state';
import { createEditingContext, IGridEditContext } from './editing';
import { IFieldFilter, IPagination, ISortColumn } from './types-pagination';

export interface IGridContext {
    pagination?: IPagination | null;
    setPagination?: Setter<IPagination>;
    resetPagination?: () => void;

    sort?: ISortColumn | null;
    setSort?: Setter<ISortColumn | null>;

    filters?: IFieldFilter[];
    setFilters?: Setter<IFieldFilter[]>;

    isLoading?: boolean;
    setIsLoading?: Setter<boolean>;

    editingContext?: IGridEditContext | null;
}

export const GridContext = React.createContext<IGridContext>({});

export const useGridContext = () => useContext<IGridContext>(GridContext);

export function createGridContext<TModel extends object>(
    props: IGridProps<TModel>,
    state: IGridState
): IGridContext {
    return {
        pagination: state.pagination,
        setPagination: state.setPagination,
        resetPagination: () => {
            if (!state.pagination?.pageSize) {
                return;
            }
            state.setPagination({
                currentPage: 1,
                pageSize: state.pagination?.pageSize,
            });
        },
        sort: state.sort,
        setSort: state.setSort,
        filters: state.filters,
        setFilters: state.setFilters,
        isLoading: state.isLoading,
        setIsLoading: state.setIsLoading,
        editingContext: createEditingContext(state, props),
    };
}
