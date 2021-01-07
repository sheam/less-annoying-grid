import * as React from 'react';
import { useContext } from 'react';
import
{
    Direction,
    ElementOrString,
    GridEditMode,
    IEditField,
    IGridProps,
    IRowData,
    Setter
} from './types-grid';
import { IGridState } from './state';
import
{
    addRow, advanceEditField,
    createNewRow, deleteRow,
    revertRows,
    updateRow
} from './editing';
import { IFieldFilter, IPagination, ISortColumn } from './types-pagination';
import { IProgress } from "../index";

export interface IGridContext<TModel extends object>
{
    pagination?: IPagination | null;
    setPagination?: Setter<IPagination>;
    resetPagination?: () => void;

    sort?: ISortColumn | null;
    setSort?: Setter<ISortColumn | null>;

    filters?: IFieldFilter[];
    setFilters?: Setter<IFieldFilter[]>;

    isLoading?: boolean;
    setIsLoading?: Setter<boolean>;

    showDetailForRow?: (rowId: string, show: boolean) => void;
    renderRowDetail?: (model: TModel) => JSX.Element;
    rowDetailButtonShowingContent?: ElementOrString;
    rowDetailButtonHiddenContent?: ElementOrString;

    editingContext?: IGridEditContext<TModel> | null;

    pushRoute?: (route: string) => void;
}

export const GridContext = React.createContext({});

export const useGridContext = <TModel extends object>() =>
    useContext<IGridContext<TModel>>(GridContext);

export function createGridContext<TModel extends object>(
    props: IGridProps<TModel>,
    state: IGridState<TModel>
): IGridContext<TModel>
{
    return {
        pagination: state.pagination,
        setPagination: state.setPagination,
        resetPagination: () =>
        {
            if (!state.pagination?.pageSize)
            {
                return;
            }
            state.setPagination({
                currentPage: 1,
                pageSize: state.pagination?.pageSize,
            });
        },
        sort: state.sort,
        setSort: state.setSort,
        filters: state.filters,
        setFilters: state.setFilters,
        isLoading: state.isLoading,
        setIsLoading: state.setIsLoading,
        renderRowDetail: props.renderRowDetail,
        editingContext: createEditingContext(state, props),
        showDetailForRow: (rowId, show) => showDetailForRow(rowId, show, state),
        rowDetailButtonShowingContent: props.rowDetailButtonShowingContent,
        rowDetailButtonHiddenContent: props.rowDetailButtonHiddenContent,
        pushRoute: props.pushRoute,
    };
}

function showDetailForRow<TModel extends object>(
    rowId: string,
    show: boolean,
    state: IGridState<TModel>
): void
{
    const data = state.dataState.data;
    const index = data.findIndex(r => r.rowId === rowId);
    if (index < 0)
    {
        throw new Error(
            `Unable to file row with id '${rowId}' to show detail for`
        );
    }
    data[index].showDetail = show;
    state.setDataState({ totalCount: state.dataState.totalCount, data });
}

export interface IGridEditContext<TModel extends object>
{
    editMode: GridEditMode;
    autoSave: boolean;

    needsSave: boolean;
    syncProgress: IProgress | null;
    validationErrors: boolean;

    editField: IEditField<TModel> | null;
    setEditField: (field: string | null, rowData: IRowData<TModel> | null) => void;
    advanceEditField: (direction: Direction) => void;

    updateRow: (rowId: string, model: TModel) => IRowData<TModel>;
    addRow: (model?: TModel) => IRowData<TModel>;
    deleteRow: (rowId: string) => void;
    revertAll: () => void;
    revertRow: (rowId: string) => void;

    modelEditor: JSX.Element | undefined;
    modelTypeName: string;

    sync: () => void;
}

export function createEditingContext<TModel extends object>(
    state: IGridState<TModel>,
    props: IGridProps<TModel>
): IGridEditContext<TModel> | null
{
    if (!props.editable)
    {
        return null;
    }

    return {
        needsSave: state.needsSave,
        syncProgress: state.syncProgress,
        editField: state.editField,
        setEditField: (f: string | null, r: IRowData<TModel> | null) => r ? state.setEditField({ field: f, rowData: r }) : state.setEditField(null),
        updateRow: (rowId: string, model: TModel) => updateRow(rowId, model, state, props),
        addRow: (model?: TModel) =>
            addRow(model || createNewRow(props.columns), state, props),
        deleteRow: (rowId: string) => deleteRow(rowId, state, props),
        editMode: props.editable.editMode,
        autoSave: props.editable.autoSave,
        sync: () => state.setSaveRequested(true),
        validationErrors: state.validationErrors,
        revertAll: () => revertRows(state.dataState.data.map(r => r.rowId), state),
        revertRow: (r: string) => revertRows([r], state),
        modelEditor: props.editable.modelEditor,
        modelTypeName: props.editable.modelTypeName,
        advanceEditField: dir => advanceEditField(state, props.columns, dir),
    };
}
