import { Column } from '../columns/column-types';
import { IFooterProps } from '../header-footer/footer';
import { IProgress, ISyncData, ISyncDataResult, SyncAction } from './sync';

export type Setter<TVal> = (v: TVal) => void;

export enum GridEditMode {
    inline = 'inline',
    row = 'row',
    external = 'external',
}

export interface IGridProps<TModel extends object> {
    columns: Array<Column<TModel>>;
    footer?: IFooterProps;

    sortAscLabel?: JSX.Element | string;
    sortDescLabel?: JSX.Element | string;

    getDataAsync: (
        pagination: IPagination | null,
        sort: ISortColumn | null,
        filters: IFieldFilter[]
    ) => Promise<IDataResult<TModel>>;

    editable?: IGridEditConfig<TModel>;
}

export interface IGridEditConfig<TModel extends object> {
    editMode: GridEditMode;
    autoSave: boolean;
    addToBottom?: boolean;
    syncChanges: (
        changes: Array<ISyncData<TModel>>,
        updateProgress: (
            p: IProgress,
            interimResults?: Array<ISyncDataResult<TModel>>
        ) => void
    ) => Promise<Array<ISyncDataResult<TModel>>>;
}

export enum Direction {
    none = 'none',
    forward = 'forward',
    backward = 'backward',
}

export interface IDataState {
    totalCount: number;
    data: IRowData[];
}

export interface IRowData {
    rowNumber: number;
    rowId: string;
    model: any;
    syncAction: SyncAction;
}

export interface IEditField {
    rowId: string;
    field: string;
}

export interface IFieldFilter {
    field: string;
    value: string;
    operator: 'eq' | 'ne' | 'gt' | 'ge' | 'lt' | 'le' | 'contains';
}

export interface ISortColumn {
    field: string;
    direction: 'ASC' | 'DESC';
}

export interface IPagination {
    currentPage: number;
    pageSize: number;
}

export interface IDataResult<TModel extends object> {
    totalCount: number;
    data: TModel[];
}
