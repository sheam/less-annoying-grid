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

export interface IGridContext<TSummaryModel extends object, TEditModel extends object, TDetailModel extends object>
{
    dataModel?: Array<IRowData<TSummaryModel>>;
    pagination?: IPagination | null;
    setPagination?: Setter<IPagination>;
    resetPagination?: () => void;

    sort?: ISortColumn | null;
    setSort?: Setter<ISortColumn | null>;

    filters?: IFieldFilter[];
    setFilters?: Setter<IFieldFilter[]>;

    isLoading?: boolean;
    setIsLoading?: Setter<boolean>;
    getLoadSingleState?: (m: TSummaryModel) => ElementOrString;
    getDetailModelAsync?: (model: TSummaryModel) => Promise<TDetailModel>;
    showDetailForRow?: (rowId: string, show: boolean) => void;
    renderRowDetail?: (model: TDetailModel) => JSX.Element;
    rowDetailButtonShowingContent?: ElementOrString;
    rowDetailButtonHiddenContent?: ElementOrString;

    editingContext?: IGridEditContext<TSummaryModel, TEditModel> | null;

    pushRoute?: (route: string) => void;
}

export const GridContext = React.createContext({});

export const useGridContext = <TSummaryModel extends object, TEditModel extends object, TDetailModel extends object>() =>
    useContext<IGridContext<TSummaryModel, TEditModel, TDetailModel>>(GridContext);

export function createGridContext<TSummaryModel extends object, TEditModel extends object, TDetailModel extends object>(
    props: IGridProps<TSummaryModel, TEditModel, TDetailModel>,
    state: IGridState<TSummaryModel>
): IGridContext<TSummaryModel, TEditModel, TDetailModel>
{
    return {
        dataModel: state.dataState.data,
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
        getLoadSingleState: props.getLoadSingleState,
        getDetailModelAsync: props.getDetailModelAsync || defaultGetDetailModel,
        renderRowDetail: props.renderRowDetail,
        editingContext: createEditingContext(state, props),
        showDetailForRow: (rowId, show) => showDetailForRow(rowId, show, state),
        rowDetailButtonShowingContent: props.rowDetailButtonShowingContent,
        rowDetailButtonHiddenContent: props.rowDetailButtonHiddenContent,
        pushRoute: props.pushRoute,
    };
}

function showDetailForRow<TSummaryModel extends object>(
    rowId: string,
    show: boolean,
    state: IGridState<TSummaryModel>
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

export interface IGridEditContext<TSummaryModel extends object, TEditModel extends object>
{
    editMode: GridEditMode;
    autoSave: boolean;

    needsSave: boolean;
    syncProgress: IProgress | null;
    validationErrors: boolean;

    editField: IEditField<TSummaryModel> | null;
    setEditField: (field: string | null, rowData: IRowData<TSummaryModel> | null) => void;
    advanceEditField: (direction: Direction) => void;

    getLoadSingleState?: (m: TSummaryModel) => ElementOrString;
    getEditModelAsync: (model: TSummaryModel) => Promise<TEditModel>
    updateRow: (rowId: string, model: TEditModel) => IRowData<TSummaryModel>;
    addRow: (model?: TEditModel) => IRowData<TSummaryModel>;
    deleteRow: (rowId: string) => void;
    revertAll: () => void;
    revertRow: (rowId: string) => void;

    modelEditor: JSX.Element | undefined;
    modelTypeName: string;

    sync: () => void;
}

function defaultGetEditModel<TSummaryModel extends object, TEditModel extends object>(m: TSummaryModel): Promise<TEditModel>
{
    const editModel = (m as any) as TEditModel;
    return Promise.resolve(editModel);
}

function defaultGetDetailModel<TSummaryModel extends object, TDetailModel extends object>(m: TSummaryModel): Promise<TDetailModel>
{
    const detailModel = (m as any) as TDetailModel;
    return Promise.resolve(detailModel);
}

export function createEditingContext<TSummaryModel extends object, TEditModel extends object, TDetailModel extends object>(
    state: IGridState<TSummaryModel>,
    props: IGridProps<TSummaryModel, TEditModel, TDetailModel>
): IGridEditContext<TSummaryModel, TEditModel> | null
{
    if (!props.editable)
    {
        return null;
    }

    return {
        needsSave: state.needsSave,
        syncProgress: state.syncProgress,
        editField: state.editField,
        getLoadSingleState: props.getLoadSingleState,
        getEditModelAsync: props.editable.getEditModelAsync || defaultGetEditModel,
        setEditField: (f: string | null, r: IRowData<TSummaryModel> | null) => r ? state.setEditField({ field: f, rowData: r }) : state.setEditField(null),
        updateRow: (rowId: string, model: TEditModel) => updateRow(rowId, model, state, props),
        addRow: (model?: TEditModel) =>
            addRow(createNewRow(model, props.columns) as TEditModel, state, props),
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
