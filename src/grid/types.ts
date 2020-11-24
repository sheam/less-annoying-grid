export interface IColumn<TModel extends object> {
    type: 'data';
    name: string;
    field?: string;
    hidden?: boolean;
    sortable?: boolean;
    editable?: ColumnEditorType;
    renderDisplay?: (model: TModel) => JSX.Element | string;
}

export interface IEditorText {
    type: 'text';
    maxLength?: number;
}

export interface IEditorNumber {
    type: 'number';
    min?: number;
    max?: number;
    step?: number;
}

export interface IEditorDate {
    type: 'date';
    startRange?: Date;
    endRange?: Date;
}

export interface IEditorValues {
    type: 'values';
    subType: 'text' | 'number';
    values: { text: string; value: any }[];
}

export type ColumnEditorType =
    | IEditorText
    | IEditorNumber
    | IEditorDate
    | IEditorValues;

export enum GridEditMode {
    inline = 'inline',
    row = 'row',
    external = 'external',
}

export interface IColumnGroup<TModel extends object> {
    type: 'group';
    name: string;
    hidden?: boolean;
    subColumns?: Array<IColumn<TModel>>;
}

export interface IActionColumn<TModel extends object> {
    type: 'action';
    name: string;
    hidden?: boolean;
    actions: Array<IAction<TModel>>;
}

export interface IRowData {
    rowId: number;
    model: any;
    syncAction: SyncAction;
}

export enum SyncAction {
    unchanged = 'unchanged',
    added = 'added',
    updated = 'updated',
    deleted = 'deleted',
}

export interface IEditField {
    rowId: number;
    field: string;
}

export interface IAction<TModel extends object> {
    name: string;
    buttonContent: JSX.Element | string;
    handler: (
        data: TModel,
        rowId: number,
        currentSyncAction: SyncAction
    ) => void;
}

export type Column<TModel extends object> =
    | IColumn<TModel>
    | IColumnGroup<TModel>
    | IActionColumn<TModel>;

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

export interface IDataState {
    totalCount: number;
    data: IRowData[];
}

export enum Direction {
    none = 'none',
    forward = 'forward',
    backward = 'backward',
}

export type Setter<TVal> = (v: TVal) => void;

export interface ISyncData<TModel extends object> {
    model: TModel | null;
    rowId: number;
    syncAction: SyncAction;
}

export interface ISyncDataResult<TModel extends object>
    extends ISyncData<TModel> {
    success: boolean;
    error?: string;
}

export interface IProgress {
    current: number;
    total: number;
    message?: string;
}
