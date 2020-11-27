import { useState } from 'react';
import { IDataState, IEditField, IGridProps, Setter } from './types-grid';
import { IFieldFilter, IPagination, ISortColumn } from './types-pagination';
import { IProgress } from './types-sync';

export interface IGridState<TModel extends object>
{
    pagination: IPagination | null;
    setPagination: Setter<IPagination>;
    isEditing: boolean;
    setIsEditing: Setter<boolean>;
    dataState: IDataState<TModel>;
    setDataState: Setter<IDataState<TModel>>;
    sort: ISortColumn | null;
    setSort: Setter<ISortColumn | null>;
    filters: IFieldFilter[];
    setFilters: Setter<IFieldFilter[]>;
    editField: IEditField | null;
    setEditField: Setter<IEditField | null>;
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

export function useGridState<TModel extends object>(
    props: IGridProps<TModel>
): IGridState<TModel>
{
    const initialPagination = props.footer?.initialPageSize
        ? { pageSize: props.footer?.initialPageSize, currentPage: 1 }
        : null;
    const [pagination, setPagination] = useState<IPagination | null>(
        initialPagination
    );
    const [sort, setSort] = useState<ISortColumn | null>(null);
    const [filters, setFilters] = useState<IFieldFilter[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [syncProgress, setSyncProgress] = useState<IProgress | null>(null);
    const [dataState, setDataState] = useState<IDataState<TModel>>({
        totalCount: 0,
        data: [],
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editField, setEditField] = useState<IEditField | null>(null);
    const [saveRequested, setSaveRequested] = useState<boolean>(false);
    const [needsSave, setNeedsSave] = useState(false);
    const [validationErrors, setValidationErrors] = useState(false);

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
        isEditing,
        setIsEditing,
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
