/* tslint:disable:jsx-no-multiline-js */
import * as React from 'react';
import {PropsWithChildren, useEffect, useState} from 'react';
import {GridContext, IGridContext} from './context';
import {Footer, IFooterProps} from './footer';
import './grid.css';
import {Header} from './header';
import {
    Column,
    GridEditMode,
    IDataResult,
    IDataState,
    IEditField,
    IFieldFilter,
    IPagination,
    IRowData,
    ISortColumn, Setter,
    SyncAction
} from './types';
import {Row} from "./rowData";
import {hasChanged} from "./util";

interface IGridProps<TModel extends object>
{
    columns: Array<Column<TModel>>;
    footer?: IFooterProps;

    sortAscLabel?: JSX.Element | string;
    sortDescLabel?: JSX.Element | string;

    getDataAsync: (pagination: IPagination, sort: ISortColumn|null, filters: IFieldFilter[]) => Promise<IDataResult<TModel>>;

    editable?: IGridEditConfig<TModel>;
}

interface IGridEditConfig<TModel extends object>
{
    editMode: GridEditMode;
    autoSave: boolean;
    updateModelAsync: (model: TModel) => Promise<TModel>;
    addModelAsync: (model: TModel) => Promise<TModel>;
    deleteModelAsync: (model: TModel) => Promise<void>;
}

interface IChildren
{
    children?: {
        toolbar?: JSX.Element;
        emptyState?: JSX.Element;
        loadingState?: JSX.Element;
        savingState?: JSX.Element;
    };
}

export const Grid = <TModel extends object>(props: IGridProps<TModel> & PropsWithChildren<IChildren>) =>
{
    const [pagination, setPagination] = useState<IPagination>(getDefaultPagination(props.footer?.initialPageSize));
    const [sort, setSort] = useState<ISortColumn|null>(null);
    const [filters, setFilters] = useState<IFieldFilter[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [dataState, setDataState] = useState<IDataState>({ totalCount: 0, data: [] });
    const [isEditing, setIsEditing] = useState(false);
    const [needsSave, setNeedsSave] = useState(false);
    const [editField, setEditField] = useState<IEditField|null>(null);

    useEffect(() => loadData(setDataState, setIsLoading, pagination, sort, filters, props.getDataAsync),
        [pagination, sort, filters, props]);

    const context: IGridContext = {
        pagination,
        setPagination,
        resetPagination: () => setPagination(getDefaultPagination(props.footer?.initialPageSize)),
        sort,
        setSort,
        filters,
        setFilters,
        isLoading: isLoading,
        setIsLoading: setIsLoading,
    };
    if(props.editable)
    {
        context.editingContext = {
            isEditing,
            needsSave,
            isSaving,
            editField,
            setEditField: (ef) => setCurrentEditField(ef, dataState, setEditField, setIsEditing),
            updateRow: (rowData) => updateRow(rowData, dataState, needsSave, setNeedsSave),
            editMode: props.editable.editMode,
            autoSave: props.editable.autoSave,
        };
    }

    const totalColumns = props.columns.flatMap(c => c.type === 'group' ? c.subColumns : c).length;
    const showLoading = isLoading && props.children?.loadingState;
    const showSaving = isSaving && props.children?.savingState;
    const showSync = showLoading || showSaving;

    return (
        <GridContext.Provider value={context}>
            <div className="bn-grid">
                <div hidden={!showSync} className="sync-panel">
                    <div className="sync-panel-content">
                        {showLoading && props.children?.loadingState}
                        {showSaving && props.children?.savingState}
                    </div>
                </div>
                <table>
                    <Header
                        columns={props.columns}
                        toolbar={props.children?.toolbar}
                        sortAscLabel={props.sortAscLabel}
                        sortDescLabel={props.sortDescLabel}
                    />

                    <tbody>
                    {!showLoading && !dataState.totalCount && props.children?.emptyState &&
                     <tr>
                         <td colSpan={totalColumns}>
                             {props.children.emptyState}
                         </td>
                     </tr>
                    }
                    {dataState.data.map(d => <Row key={d.rowId} columns={props.columns} data={d} />)}
                    </tbody>

                    {pagination &&
                     <Footer
                         numColumns={totalColumns}
                         totalCount={dataState.totalCount}
                         config={props.footer}
                     />
                    }
                </table>
            </div>
        </GridContext.Provider>
    );
};

function useGridState(initialPageSize: number)
{
    const [pagination, setPagination] = useState<IPagination>(getDefaultPagination(initialPageSize));
    const [sort, setSort] = useState<ISortColumn|null>(null);
    const [filters, setFilters] = useState<IFieldFilter[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [dataState, setDataState] = useState<IDataState>({ totalCount: 0, data: [] });
    const [isEditing, setIsEditing] = useState(false);
    const [needsSave, setNeedsSave] = useState(false);
    const [editField, setEditField] = useState<IEditField|null>(null);

    return {
        pagination, setPagination,
        sort, setSort,
        filters, setFilters,
        isLoading, setIsLoading,
        isSaving, setIsSaving,
        dataState, setDataState,
        isEditing, setIsEditing,
        needsSave, setNeedsSave,
        editField, setEditField,
    };
}

function loadData<TModel extends object>(
    setDataState: Setter<IDataState>,
    setIsLoading: Setter<boolean>,
    pagination: IPagination,
    sort: ISortColumn|null,
    filters: IFieldFilter[],
    getDataAsync: (p: IPagination, s: ISortColumn|null, f: IFieldFilter[]) => Promise<IDataResult<TModel>>)
{
    const fetch = async () => {
        const d = await getDataAsync(pagination, sort, filters);
        const newState: IDataState = {
            totalCount: d.totalCount,
            data: d.data.map((m,i) =>
            {
                const result: IRowData = {
                    syncAction: SyncAction.unchanged,
                    model: m,
                    rowId: i+1,
                };
                return result;
            }),
        };
        setDataState(newState);
        setIsLoading(false);
    };

    setIsLoading(true);
    // noinspection JSIgnoredPromiseFromCall
    fetch();
}

function updateRow(rowData: IRowData, dataState: IDataState, needsSave: boolean, setNeedsSave: Setter<boolean>): boolean
{
    console.log('saving row');
    const existingRow = dataState.data.find(r => r.rowId === rowData.rowId);
    if(!existingRow)
    {
        throw new Error(`unable to find row with id=${rowData.rowId}`);
    }
    existingRow.syncAction = rowData.syncAction;
    existingRow.model = rowData.model;
    setNeedsSave(needsSave||hasChanged(rowData));

    return true; //success
}

const setCurrentEditField = (editField: IEditField|null, dataState: IDataState, setEditField: Setter<IEditField|null>, setIsEditing: Setter<boolean>) =>
{
    if(editField)
    {
        const row = dataState.data.find(r => r.rowId === editField.rowId);
        if(row)
        {
            setEditField(editField);
            setIsEditing(true);
        }
        else
        {

            setEditField(null);
            setIsEditing(false);
        }
    }
    else
    {
        setEditField(null);
        setIsEditing(false);
    }
}

function getDefaultPagination(initialPageSize: number|undefined): IPagination
{
    return { currentPage: 1, pageSize: initialPageSize||10};
}
