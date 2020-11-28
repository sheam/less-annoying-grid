import { Column } from './columns/types';
import { IFooterProps } from './header-footer/footer';
import
{
    IDataResult,
    IFieldFilter,
    IPagination,
    ISortColumn,
} from './types-pagination';
import
{
    IProgress,
    ISyncData,
    ISyncDataResult,
    SyncAction,
} from './types-sync';

export enum GridEditMode
{
    inline = 'inline',
    row = 'row',
    external = 'external',
}

export type Setter<TVal> = (v: TVal) => void;
export type ElementOrString = JSX.Element | string;

export enum Direction
{
    none = 'none',
    forward = 'forward',
    backward = 'backward',
}

export interface IGridProps<TModel extends object>
{
    columns: Array<Column<TModel>>;
    footer?: IFooterProps;

    sortAscLabel?: ElementOrString;
    sortDescLabel?: ElementOrString;

    renderRowDetail?: (model: TModel) => JSX.Element;
    rowDetailButtonShowingContent?: ElementOrString;
    rowDetailButtonHiddenContent?: ElementOrString;

    getDataAsync: (
        pagination: IPagination | null,
        sort: ISortColumn | null,
        filters: IFieldFilter[]
    ) => Promise<IDataResult<TModel>>;

    editable?: IGridEditConfig<TModel>;
}

export interface IGridEditConfig<TModel extends object>
{
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
    modelEditor?: JSX.Element;
}

export interface IEditField
{
    rowId: string;
    field: string;
}

export interface IDataState<TModel extends object>
{
    totalCount: number;
    data: IRowData<TModel>[];
}

export interface IRowData<TModel extends object>
{
    rowNumber: number;
    rowId: string;
    model: TModel;
    syncAction: SyncAction;
    showDetail: boolean;
    validationErrors?: IValidationError[] | null;
}

export interface IValidationError
{
    field: string;
    error: string;
}
