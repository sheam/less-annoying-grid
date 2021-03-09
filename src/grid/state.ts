import * as React from 'react';
import { IDataState, IEditField, IGridProps, Setter } from './types-grid';
import { IFieldFilter, IPagination, ISortColumn } from './types-pagination';
import { IProgress } from './types-sync';

export interface IGridState<TSummaryModel extends object>
{
    pagination: IPagination | null;
    setPagination: Setter<IPagination>;
    dataState: IDataState<TSummaryModel>;
    setDataState: Setter<IDataState<TSummaryModel>>;
    sort: ISortColumn | null;
    setSort: Setter<ISortColumn | null>;
    filters: IFieldFilter[];
    setFilters: Setter<IFieldFilter[]>;
    editField: IEditField<TSummaryModel> | null;
    setEditField: Setter<IEditField<TSummaryModel> | null>;
    syncProgress: IProgress | null;
    setSyncProgress: Setter<IProgress | null>;
    needsSave: boolean;
    setNeedsSave: Setter<boolean>;
    isLoading: boolean;
    setIsLoading: Setter<boolean>;
    saveRequested: boolean;
    setSaveRequested: Setter<boolean>;
    validationErrors: boolean;
    setValidationErrors: Setter<boolean>;
}

export function useGridState<TSummaryModel extends object, TEditModel extends object>(
    props: IGridProps<TSummaryModel, TEditModel>
): IGridState<TSummaryModel>
{
    const initialPagination = props.footer?.initialPageSize
        ? { pageSize: props.footer?.initialPageSize, currentPage: 1 }
        : null;
    const [pagination, setPagination] = React.useState<IPagination | null>(
        initialPagination
    );
    const [sort, setSort] = React.useState<ISortColumn | null>(null);
    const [filters, setFilters] = React.useState<IFieldFilter[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [syncProgress, setSyncProgress] = React.useState<IProgress | null>(null);
    const [dataState, setDataState] = React.useState<IDataState<TSummaryModel>>({
        totalCount: 0,
        data: [],
    });
    const [editField, setEditField] = React.useState<IEditField<TSummaryModel> | null>(null);
    const [saveRequested, setSaveRequested] = React.useState<boolean>(false);
    const [needsSave, setNeedsSave] = React.useState(false);
    const [validationErrors, setValidationErrors] = React.useState(false);

    return {
        pagination,
        setPagination,
        sort,
        setSort,
        filters,
        setFilters,
        isLoading,
        setIsLoading,
        syncProgress,
        setSyncProgress,
        dataState,
        setDataState,
        needsSave,
        setNeedsSave,
        editField,
        setEditField,
        saveRequested,
        setSaveRequested,
        validationErrors,
        setValidationErrors,
    };
}
