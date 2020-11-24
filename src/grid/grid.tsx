/* tslint:disable:jsx-no-multiline-js */
import * as React from 'react';
import { PropsWithChildren, useEffect, useState } from 'react';
import { GridContext, IGridContext } from './context';
import { Footer, IFooterProps } from './footer';
import './grid.css';
import { Header } from './header';
import {
    Column,
    GridEditMode,
    IDataResult,
    IDataState,
    IEditField,
    IFieldFilter,
    IPagination,
    IProgress,
    IRowData,
    ISortColumn,
    ISyncData,
    ISyncDataResult,
    Setter,
    SyncAction,
} from './types';
import { Row } from './rowData';
import { hasChanged } from './util';

interface IGridProps<TModel extends object> {
    columns: Array<Column<TModel>>;
    footer?: IFooterProps;

    sortAscLabel?: JSX.Element | string;
    sortDescLabel?: JSX.Element | string;

    getDataAsync: (
        pagination: IPagination,
        sort: ISortColumn | null,
        filters: IFieldFilter[]
    ) => Promise<IDataResult<TModel>>;

    editable?: IGridEditConfig<TModel>;
}

interface IGridEditConfig<TModel extends object> {
    editMode: GridEditMode;
    autoSave: boolean;
    syncChanges: (
        changes: Array<ISyncData<TModel>>,
        updateProgress: Setter<IProgress>
    ) => Promise<Array<ISyncDataResult<TModel>>>;
}

interface IChildren {
    children?: {
        toolbar?: JSX.Element;
        emptyState?: JSX.Element;
        loadingState?: JSX.Element;
        savingState?: JSX.Element;
    };
}

export const Grid = <TModel extends object>(
    props: IGridProps<TModel> & PropsWithChildren<IChildren>
) => {
    const state = useGridState(props);

    useEffect(
        () => loadData(state, props.getDataAsync),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [state.pagination, state.sort, state.filters, props]
    );

    const context = getGridContext(props, state);

    const totalColumns = props.columns.flatMap(c =>
        c.type === 'group' ? c.subColumns : c
    ).length;
    const showLoading = state.isLoading && props.children?.loadingState;
    const showSaving = state.isSaving && props.children?.savingState;
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
                        {!showLoading &&
                            !state.dataState.totalCount &&
                            props.children?.emptyState && (
                                <tr>
                                    <td colSpan={totalColumns}>
                                        {props.children.emptyState}
                                    </td>
                                </tr>
                            )}
                        {state.dataState.data.map(d => (
                            <Row
                                key={d.rowId}
                                columns={props.columns}
                                data={d}
                            />
                        ))}
                    </tbody>

                    {state.pagination && (
                        <Footer
                            numColumns={totalColumns}
                            totalCount={state.dataState.totalCount}
                            config={props.footer}
                        />
                    )}
                </table>
            </div>
        </GridContext.Provider>
    );
};

function getGridContext<TModel extends object>(
    props: IGridProps<TModel>,
    state: IGridState
): IGridContext {
    const context: IGridContext = {
        pagination: state.pagination,
        setPagination: state.setPagination,
        resetPagination: () =>
            state.setPagination(
                getDefaultPagination(props.footer?.initialPageSize)
            ),
        sort: state.sort,
        setSort: state.setSort,
        filters: state.filters,
        setFilters: state.setFilters,
        isLoading: state.isLoading,
        setIsLoading: state.setIsLoading,
    };
    if (props.editable) {
        context.editingContext = {
            isEditing: state.isEditing,
            needsSave: state.needsSave,
            isSaving: state.isSaving,
            editField: state.editField,
            setEditField: ef => setCurrentEditField(ef, state),
            updateRow: rowData => updateRow(rowData, state),
            editMode: props.editable.editMode,
            autoSave: props.editable.autoSave,
        };
    }
    return context;
}

interface IGridState {
    pagination: IPagination;
    setPagination: Setter<IPagination>;
    isEditing: boolean;
    setIsEditing: Setter<boolean>;
    dataState: IDataState;
    setDataState: Setter<IDataState>;
    sort: ISortColumn | null;
    setSort: Setter<ISortColumn | null>;
    filters: IFieldFilter[];
    setFilters: Setter<IFieldFilter[]>;
    editField: IEditField | null;
    setEditField: Setter<IEditField | null>;
    isSaving: boolean;
    setIsSaving: Setter<boolean>;
    needsSave: boolean;
    setNeedsSave: Setter<boolean>;
    isLoading: boolean;
    setIsLoading: Setter<boolean>;
}

function useGridState<TModel extends object>(
    props: IGridProps<TModel>
): IGridState {
    const [pagination, setPagination] = useState<IPagination>(
        getDefaultPagination(props.footer?.initialPageSize)
    );
    const [sort, setSort] = useState<ISortColumn | null>(null);
    const [filters, setFilters] = useState<IFieldFilter[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [dataState, setDataState] = useState<IDataState>({
        totalCount: 0,
        data: [],
    });
    const [isEditing, setIsEditing] = useState(false);
    const [needsSave, setNeedsSave] = useState(false);
    const [editField, setEditField] = useState<IEditField | null>(null);

    return {
        pagination,
        setPagination,
        sort,
        setSort,
        filters,
        setFilters,
        isLoading,
        setIsLoading,
        isSaving,
        setIsSaving,
        dataState,
        setDataState,
        isEditing,
        setIsEditing,
        needsSave,
        setNeedsSave,
        editField,
        setEditField,
    };
}

function loadData<TModel extends object>(
    state: IGridState,
    getDataAsync: (
        p: IPagination,
        s: ISortColumn | null,
        f: IFieldFilter[]
    ) => Promise<IDataResult<TModel>>
) {
    const fetch = async () => {
        const d = await getDataAsync(
            state.pagination,
            state.sort,
            state.filters
        );
        const newState: IDataState = {
            totalCount: d.totalCount,
            data: d.data.map((m, i) => {
                const result: IRowData = {
                    syncAction: SyncAction.unchanged,
                    model: m,
                    rowId: i + 1,
                };
                return result;
            }),
        };
        state.setDataState(newState);
        state.setIsLoading(false);
    };

    state.setIsLoading(true);

    // noinspection JSIgnoredPromiseFromCall
    fetch();
}

function updateRow(rowData: IRowData, state: IGridState): boolean {
    console.log('saving row');
    const existingRow = state.dataState.data.find(
        r => r.rowId === rowData.rowId
    );
    if (!existingRow) {
        throw new Error(`unable to find row with id=${rowData.rowId}`);
    }
    existingRow.syncAction = rowData.syncAction;
    existingRow.model = rowData.model;
    state.setNeedsSave(state.needsSave || hasChanged(rowData));

    return true; //success
}

const setCurrentEditField = (
    editField: IEditField | null,
    state: IGridState
) => {
    if (editField) {
        const row = state.dataState.data.find(r => r.rowId === editField.rowId);
        if (row) {
            state.setEditField(editField);
            state.setIsEditing(true);
        } else {
            state.setEditField(null);
            state.setIsEditing(false);
        }
    } else {
        state.setEditField(null);
        state.setIsEditing(false);
    }
};

function getDefaultPagination(
    initialPageSize: number | undefined
): IPagination {
    return { currentPage: 1, pageSize: initialPageSize || 10 };
}

async function syncChanges<TModel extends object>(
    state: IGridState,
    props: IGridProps<TModel>
): Promise<ISyncDataResult<TModel>[]> {
    if (!props.editable) {
        throw new Error(
            'attempt to call syncChanges when grid is not editable'
        );
    }
    if (state.isSaving) {
        throw new Error(
            'attempt to call syncChanges when sync already in progress'
        );
    }

    const updateProgress = (p: IProgress) => {};

    state.setIsSaving(true);
    const changes = state.dataState.data
        .filter(r => hasChanged(r))
        .map(r => {
            const result: ISyncData<TModel> = {
                model: r.model,
                rowId: r.rowId,
                syncAction: r.syncAction,
            };
            return result;
        });

    try {
        const result = await props.editable.syncChanges(
            changes,
            updateProgress
        );
        return result;
    } finally {
        state.setIsSaving(false);
    }
}
