import * as React from 'react';
import { useContext } from 'react';
import { ElementOrString, IGridProps, Setter } from './types-grid';
import { IGridState } from './state';
import { createEditingContext, IGridEditContext } from './editing';
import { IFieldFilter, IPagination, ISortColumn } from './types-pagination';

export interface IGridContext<TModel extends object>
{
    pagination ?: IPagination | null;
    setPagination ?: Setter<IPagination>;
    resetPagination ?: () => void;

    sort ?: ISortColumn | null;
    setSort ?: Setter<ISortColumn | null>;

    filters ?: IFieldFilter[];
    setFilters ?: Setter<IFieldFilter[]>;

    isLoading ?: boolean;
    setIsLoading ?: Setter<boolean>;

    showDetailForRow ?: (rowId : string, show : boolean) => void;
    renderRowDetail ?: (model : TModel) => JSX.Element;
    rowDetailButtonShowingContent ?: ElementOrString;
    rowDetailButtonHiddenContent ?: ElementOrString;

    editingContext ?: IGridEditContext<TModel> | null;
}

export const GridContext = React.createContext({});

export const useGridContext = <TModel extends object>() =>
    useContext<IGridContext<TModel>>(GridContext);

export function createGridContext<TModel extends object>(
    props : IGridProps<TModel>,
    state : IGridState<TModel>
) : IGridContext<TModel>
{
    return {
        pagination: state.pagination,
        setPagination: state.setPagination,
        resetPagination: () =>
        {
            if (!state.pagination?.pageSize)
            {
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
        renderRowDetail: props.renderRowDetail,
        editingContext: createEditingContext(state, props),
        showDetailForRow: (rowId, show) => showDetailForRow(rowId, show, state),
        rowDetailButtonShowingContent: props.rowDetailButtonShowingContent,
        rowDetailButtonHiddenContent: props.rowDetailButtonHiddenContent,
    };
}

function showDetailForRow<TModel extends object>(
    rowId : string,
    show : boolean,
    state : IGridState<TModel>
) : void
{
    const data = state.dataState.data;
    const index = data.findIndex(r => r.rowId === rowId);
    if (index < 0)
    {
        throw new Error(
            `Unable to file row with id '${rowId}' to show detail for`
        );
    }
    data[index].showDetail = show;
    state.setDataState({ totalCount: state.dataState.totalCount, data });
}
