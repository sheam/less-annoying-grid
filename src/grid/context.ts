/* tslint:disable:interface-over-type-literal */
import * as React from 'react';
import {useContext} from 'react';
import {GridEditMode, IEditField, IFieldFilter, IPagination, IRowData, ISortColumn} from './types';

export interface IGridContext
{
    pagination?: IPagination;
    setPagination?: (p: IPagination) => void;
    resetPagination?: () => void;

    sort?: ISortColumn|null;
    setSort?: (s: ISortColumn|null) => void;

    filters?: IFieldFilter[];
    setFilters?: (fs: IFieldFilter[]) => void;

    isLoading?: boolean;
    setIsLoading?: (isLoading: boolean) => void;

    editingContext?: IGridEditContext;
}

interface IGridEditContext
{
    editMode: GridEditMode
    autoSave: boolean;

    isEditing: boolean;

    needsSave: boolean;
    isSaving: boolean;

    editField: IEditField|null;
    setEditField: (editField: IEditField|null) => void;

    updateRow: (rowData: IRowData) => boolean;
    //deleteRow: (rowData: IRowData) => boolean;
}

export const GridContext = React.createContext<IGridContext>({});

export const useGridContext = () => useContext<IGridContext>(GridContext);
