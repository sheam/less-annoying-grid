import * as React from 'react';
import { useContext } from 'react';
import { IGridProps, Setter } from './types-grid';
import { IGridState } from './state';
import { createEditingContext, IGridEditContext } from './editing';
import { IFieldFilter, IPagination, ISortColumn } from './types-pagination';

export interface IGridContext<TModel extends object> {
    pagination?: IPagination | null;
    setPagination?: Setter<IPagination>;
    resetPagination?: () => void;

    sort?: ISortColumn | null;
    setSort?: Setter<ISortColumn | null>;

    filters?: IFieldFilter[];
    setFilters?: Setter<IFieldFilter[]>;

    isLoading?: boolean;
    setIsLoading?: Setter<boolean>;

    editingContext?: IGridEditContext<TModel> | null;
}

export const GridContext = React.createContext({});

export const useGridContext = <TModel extends object>() =>
    useContext<IGridContext<TModel>>(GridContext);

export function createGridContext<TModel extends object>(
    props: IGridProps<TModel>,
    state: IGridState<TModel>
): IGridContext<TModel> {
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
