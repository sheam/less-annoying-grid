/* tslint:disable:jsx-no-multiline-js */
import * as React from 'react';
import { useState } from 'react';
import {
    IDataState,
    IEditField,
    IFieldFilter,
    IPagination,
    IProgress,
    ISortColumn,
    Setter,
} from '../types';
import { IGridProps } from '../types';

export interface IGridState {
    pagination: IPagination | null;
    setPagination: Setter<IPagination>;
    isEditing: boolean;
    setIsEditing: Setter<boolean>;
    dataState: IDataState;
    setDataState: Setter<IDataState>;
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
}

export function useGridState<TModel extends object>(
    props: IGridProps<TModel>
): IGridState {
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
    const [dataState, setDataState] = useState<IDataState>({
        totalCount: 0,
        data: [],
    });
    const [isEditing, setIsEditing] = useState(false);
    const [needsSave, setNeedsSave] = useState(false);
    const [editField, setEditField] = useState<IEditField | null>(null);
    const [saveRequested, setSaveRequested] = useState<boolean>(false);

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
    };
}
