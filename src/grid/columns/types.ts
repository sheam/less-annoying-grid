import { ElementOrString } from '../types-grid';
import { ISyncData, SyncAction } from '../types-sync';
import { AggregateValidator } from './validation';

export interface IDataColumn<TModel extends object>
{
    type: 'data';
    name: string;
    field: string;
    hidden?: boolean;
    sortable?: boolean;
    editable?: ColumnEditorType;
    renderDisplay?: (model: TModel) => ElementOrString;
    validator?: AggregateValidator;
    defaultValue?: any | (() => any);
    className?: string;
}

interface IDisplayColumn<TModel extends object>
{
    type: 'display';
    name: string;
    hidden?: boolean;
    renderDisplay: (model: TModel) => ElementOrString;
    className?: string;
}

export interface IActionColumn<TModel extends object>
{
    type: 'action';
    name: string;
    hidden?: boolean;
    actions: Array<Action<TModel>>;
    className?: string;
}

interface IColumnGroup<TModel extends object>
{
    type: 'group';
    name: string;
    hidden?: boolean;
    subColumns?: Array<NonGroupColumn<TModel>>;
    className?: string;
}

export type Column<TModel extends object> =
    | IDataColumn<TModel>
    | IColumnGroup<TModel>
    | IDisplayColumn<TModel>
    | IActionColumn<TModel>;

export type NonGroupColumn<TModel extends object> =
    | IDataColumn<TModel>
    | IDisplayColumn<TModel>
    | IActionColumn<TModel>;

export enum ActionStatus { Active, Hidden, Disabled }

export interface IActionEdit<TModel extends object>
{
    type: 'edit';
    name?: string;
    buttonContent?: ElementOrString;
    buttonState?: (
        data: TModel,
        rowId: string,
        currentSyncAction: SyncAction
    ) => ActionStatus;
}

export interface IActionDelete<TModel extends object>
{
    type: 'delete';
    name?: string;
    buttonContent?: ElementOrString;
    buttonState?: (
        data: TModel,
        rowId: string,
        currentSyncAction: SyncAction
    ) => ActionStatus;
    confirm?:
    | boolean
    | ((model: TModel, currentSyncAction: SyncAction) => Promise<boolean>);
}

interface IActionCustom<TModel extends object>
{
    type: 'custom';
    name?: string;
    buttonContent?: ElementOrString;
    buttonState?: (
        data: TModel,
        rowId: string,
        currentSyncAction: SyncAction
    ) => ActionStatus;
    handler: (
        data: TModel,
        rowId: string,
        currentSyncAction: SyncAction,
        pushRoute?: (route: string) => void,
    ) => Array<ISyncData<TModel>>;
}

export type Action<TModel extends object> =
    | IActionEdit<TModel>
    | IActionDelete<TModel>
    | IActionCustom<TModel>;

interface IEditorText
{
    type: 'text';
    maxLength?: number;
}

interface IEditorNumber
{
    type: 'number';
    min?: number;
    max?: number;
    step?: number;
}

interface IEditorDate
{
    type: 'date';
    startRange?: Date;
    endRange?: Date;
}

interface IEditorValues
{
    type: 'values';
    subType: 'text' | 'number';
    values: { text: string; value: any }[];
}

interface IEditorCustom
{
    type: 'custom';
    editor: JSX.Element;
}

export type ColumnEditorTypeBuiltIn =
    | IEditorText
    | IEditorNumber
    | IEditorDate
    | IEditorValues;

export type ColumnEditorType =
    | IEditorText
    | IEditorNumber
    | IEditorDate
    | IEditorValues
    | IEditorCustom;
