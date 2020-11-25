import { ISyncData, SyncAction } from '../grid/sync';

export interface IDataColumn<TModel extends object> {
    type: 'data';
    name: string;
    field?: string;
    hidden?: boolean;
    sortable?: boolean;
    editable?: ColumnEditorType;
    renderDisplay?: (model: TModel) => JSX.Element | string;
}

interface IColumnGroup<TModel extends object> {
    type: 'group';
    name: string;
    hidden?: boolean;
    subColumns?: Array<IDataColumn<TModel>>;
}

export interface IActionColumn<TModel extends object> {
    type: 'action';
    name: string;
    hidden?: boolean;
    actions: Array<Action<TModel>>;
}

export type Column<TModel extends object> =
    | IDataColumn<TModel>
    | IColumnGroup<TModel>
    | IActionColumn<TModel>;

export type ActionOrDataCol<TModel extends object> =
    | IDataColumn<TModel>
    | IActionColumn<TModel>;

export interface IActionEdit {
    type: 'edit';
    name?: string;
    buttonContent?: JSX.Element | string;
}

export interface IActionDelete<TModel extends object> {
    type: 'delete';
    name?: string;
    buttonContent?: JSX.Element | string;
    confirm?:
        | boolean
        | ((model: TModel, currentSyncAction: SyncAction) => Promise<boolean>);
}

interface IActionCustom<TModel extends object> {
    type: 'custom';
    name?: string;
    buttonContent?: JSX.Element | string;
    handler: (
        data: TModel,
        rowId: string,
        currentSyncAction: SyncAction
    ) => Array<ISyncData<TModel>> | null;
}

export type Action<TModel extends object> =
    | IActionEdit
    | IActionDelete<TModel>
    | IActionCustom<TModel>;

interface IEditorText {
    type: 'text';
    maxLength?: number;
}

interface IEditorNumber {
    type: 'number';
    min?: number;
    max?: number;
    step?: number;
}

interface IEditorDate {
    type: 'date';
    startRange?: Date;
    endRange?: Date;
}

interface IEditorValues {
    type: 'values';
    subType: 'text' | 'number';
    values: { text: string; value: any }[];
}

export type ColumnEditorType =
    | IEditorText
    | IEditorNumber
    | IEditorDate
    | IEditorValues;
