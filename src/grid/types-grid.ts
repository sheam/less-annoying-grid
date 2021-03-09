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
    // row = 'row',
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

export interface IGridProps<TSummaryModel extends object, TEditModel extends object, TDetailModel extends object>
{
    columns: Array<Column<TSummaryModel>>;
    footer?: IFooterProps;

    sortAscLabel?: ElementOrString;
    sortDescLabel?: ElementOrString;
    unsortedLabel?: ElementOrString;

    getDetailModelAsync?: (model: TSummaryModel) => Promise<TDetailModel>;
    renderRowDetail?: (model: TDetailModel) => JSX.Element;
    rowDetailButtonShowingContent?: ElementOrString;
    rowDetailButtonHiddenContent?: ElementOrString;

    getLoadSingleState?: (m: TSummaryModel) => ElementOrString;

    getDataAsync: (
        pagination: IPagination | null,
        sort: ISortColumn | null,
        filters: IFieldFilter[]
    ) => Promise<IDataResult<TSummaryModel>>;

    editable?: IGridEditConfig<TSummaryModel, TEditModel>;

    pushRoute?: (route: string) => void;
}

export interface IGridEditConfig<TSummaryModel extends object, TEditModel extends object>
{
    editMode: GridEditMode;
    autoSave: boolean;
    addToBottom?: boolean;
    getEditModelAsync?: (model: TSummaryModel) => Promise<TEditModel>
    syncChanges: (
        changes: Array<ISyncData<TEditModel>>,
        updateProgress: (
            p: IProgress,
            interimResults?: Array<ISyncDataResult<TSummaryModel>>
        ) => void
    ) => Promise<Array<ISyncDataResult<TSummaryModel>>>;
    modelEditor?: JSX.Element;
    modelTypeName: string;
}

export interface IEditField<TSummaryModel extends object>
{
    rowData: IRowData<TSummaryModel>
    field: string | null;
}

export interface IDataState<TSummaryModel extends object>
{
    totalCount: number;
    data: Array<IRowData<TSummaryModel>>;
}

export interface IRowData<TSummaryModel extends object>
{
    rowNumber: number;
    rowId: string;
    model: TSummaryModel;
    originalModel: TSummaryModel;
    syncAction: SyncAction;
    showDetail: boolean;
    validationErrors?: IValidationError[] | null;
}

export interface IValidationError
{
    field: string;
    error: string;
}
