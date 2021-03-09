import { ElementOrString } from '../types-grid';
import { ISyncData, SyncAction } from '../types-sync';
import { AggregateValidator } from './validation';

//nameof operator for typescript: https://schneidenbach.gitbooks.io/typescript-cookbook/content/nameof-operator.html
export interface IDataColumn<TSummaryModel extends object>
{
    type: 'data';
    name: string;
    field: string;
    hidden?: boolean;
    sortable?: boolean;
    editable?: ColumnEditorType;
    renderDisplay?: (model: TSummaryModel) => ElementOrString;
    validator?: AggregateValidator;
    defaultValue?: any | (() => any);
    className?: string;
}

export interface IEditOnlyField<TSummaryModel extends object>
{
    type: 'field';
    name: string;
    field: string;
    editable: ColumnEditorType;
    validator?: AggregateValidator;
    defaultValue?: any | (() => any);
}

interface IDisplayColumn<TSummaryModel extends object>
{
    type: 'display';
    name: string;
    hidden?: boolean;
    renderDisplay: (model: TSummaryModel) => ElementOrString;
    className?: string;
}

export interface IActionColumn<TSummaryModel extends object>
{
    type: 'action';
    name: string;
    hidden?: boolean;
    actions: Array<Action<TSummaryModel>>;
    className?: string;
}

interface IColumnGroup<TSummaryModel extends object>
{
    type: 'group';
    name: string;
    hidden?: boolean;
    subColumns?: Array<NonGroupColumn<TSummaryModel>>;
    className?: string;
}

export type Column<TSummaryModel extends object> =
    | IDataColumn<TSummaryModel>
    | IColumnGroup<TSummaryModel>
    | IDisplayColumn<TSummaryModel>
    | IActionColumn<TSummaryModel>
    | IEditOnlyField<TSummaryModel>;

export type NonGroupColumn<TSummaryModel extends object> =
    | IDataColumn<TSummaryModel>
    | IDisplayColumn<TSummaryModel>
    | IActionColumn<TSummaryModel>;

export enum ActionStatus
{
    Active = 'active',
    Hidden = 'hidden',
    Disabled = 'disabled',
}

export interface IActionEdit<TSummaryModel extends object>
{
    type: 'edit';
    name?: string;
    buttonContent?: ElementOrString;
    buttonState?: (
        data: TSummaryModel,
        rowId: string,
        currentSyncAction: SyncAction
    ) => ActionStatus;
}

export interface IActionDelete<TSummaryModel extends object>
{
    type: 'delete';
    name?: string;
    buttonContent?: ElementOrString;
    buttonState?: (
        data: TSummaryModel,
        rowId: string,
        currentSyncAction: SyncAction
    ) => ActionStatus;
    confirm?:
    | boolean
    | ((model: TSummaryModel, currentSyncAction: SyncAction) => Promise<boolean>);
}

interface IActionCustom<TSummaryModel extends object>
{
    type: 'custom';
    name?: string;
    buttonContent?: ElementOrString;
    buttonState?: (
        data: TSummaryModel,
        rowId: string,
        currentSyncAction: SyncAction
    ) => ActionStatus;
    handler: (
        data: TSummaryModel,
        rowId: string,
        currentSyncAction: SyncAction,
        pushRoute?: (route: string) => void,
    ) => Array<ISyncData<TSummaryModel>>;
}

export type Action<TSummaryModel extends object> =
    | IActionEdit<TSummaryModel>
    | IActionDelete<TSummaryModel>
    | IActionCustom<TSummaryModel>;

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
