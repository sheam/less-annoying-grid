export interface IColumn<TModel extends object>
{
    name: string;
    hidden?: boolean;

    //data column
    field?: string;
    sortable?: boolean;
    editable?: IColumnEditable;
    renderDisplay?: (model: TModel) => JSX.Element|string;

    //group column
    subColumns?: Array<IColumn<TModel>>;

    //action column
    actions?: Array<IAction<TModel>>
}

interface IColumnEditable
{
    editor: JSX.Element;
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

export interface IDataState<TModel extends object>
{
    totalCount: number;
    data: IRowData[];
}
