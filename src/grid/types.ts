export interface IColumn<TModel extends object>
{
    type: 'data';
    name: string;
    field?: string;
    hidden?: boolean;
    sortable?: boolean;
    editable?: ColumnEditorType;
    renderDisplay?: (model: TModel) => JSX.Element|string;
}

type ColumnEditorType = 'number'|'date'|'text';
export type GridEditMode = 'inline'|'row'|'external';

export interface IColumnGroup<TModel extends object>
{
    type: 'group';
    name: string;
    hidden?: boolean;
    subColumns?: Array<IColumn<TModel>>;
}

export interface IActionColumn<TModel extends object>
{
    type: 'action';
    name: string;
    hidden?: boolean;
    actions: Array<IAction<TModel>>;
}

export interface IRowData
{
    uid: string;
    model: any;
    dirty: boolean;
}

export interface IAction<TModel extends object>
{
    name: string;
    buttonContent: JSX.Element|string;
    handler: (data: TModel, uid: string, dirty: boolean) => void;
}

export type Column<TModel extends object> = IColumn<TModel>|IColumnGroup<TModel>|IActionColumn<TModel>;

export interface IFieldFilter
{
    field: string;
    value: string;
    operator: 'eq'|'ne'|'gt'|'ge'|'lt'|'le'|'contains';
}

export interface ISortColumn {
    field: string;
    direction: 'ASC'|'DESC';
}

export interface IPagination
{
    currentPage: number;
    pageSize: number;
}

export interface IDataResult<TModel extends object>
{
    totalCount: number;
    data: TModel[];
}

export interface IDataState
{
    totalCount: number;
    data: IRowData[];
}
