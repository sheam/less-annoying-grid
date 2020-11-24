/* tslint:disable:interface-over-type-literal */
import * as React from 'react';
import {useContext} from 'react';
import {GridEditMode, IEditField, IFieldFilter, IPagination, IRowData, ISortColumn, Setter} from './types';

export interface IGridContext
{
    pagination?: IPagination;
    setPagination?: Setter<IPagination>;
    resetPagination?: () => void;

    sort?: ISortColumn|null;
    setSort?: Setter<ISortColumn|null>;

    filters?: IFieldFilter[];
    setFilters?: Setter<IFieldFilter[]>;

    isLoading?: boolean;
    setIsLoading?: Setter<boolean>;

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
    setEditField: Setter<IEditField|null>;

    updateRow: (rowData: IRowData) => boolean;
    //deleteRow: (rowData: IRowData) => boolean;
}

export const GridContext = React.createContext<IGridContext>({});

export const useGridContext = () => useContext<IGridContext>(GridContext);
