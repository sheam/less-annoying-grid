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
import { hasChanged, uuid } from './util';

interface IGridProps<TModel extends object> {
    columns: Array<Column<TModel>>;
    footer?: IFooterProps;

    sortAscLabel?: JSX.Element | string;
    sortDescLabel?: JSX.Element | string;

    getDataAsync: (
        pagination: IPagination | null,
        sort: ISortColumn | null,
        filters: IFieldFilter[]
    ) => Promise<IDataResult<TModel>>;

    editable?: IGridEditConfig<TModel>;
}

interface IGridEditConfig<TModel extends object> {
    editMode: GridEditMode;
    autoSave: boolean;
    addToBottom?: boolean;
    syncChanges: (
        changes: Array<ISyncData<TModel>>,
        updateProgress: (
            p: IProgress,
            interimResults?: Array<ISyncDataResult<TModel>>
        ) => void
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
        () => loadDataEffect(state, props.getDataAsync),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [state.pagination, state.sort, state.filters, props]
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => syncDataEffect(state, props), [state.saveRequested]);

    const context = getGridContext(props, state);

    const totalColumns = props.columns.flatMap(c =>
        c.type === 'group' ? c.subColumns : c
    ).length;
    const showLoading = state.isLoading && props.children?.loadingState;
    const showSaving = state.syncProgress && props.children?.savingState;
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
                            <Row key={d.uid} columns={props.columns} data={d} />
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
            syncProgress: state.syncProgress,
            editField: state.editField,
            setEditField: ef => setCurrentEditField(ef, state),
            updateRow: rowData => updateRow(rowData, state, props),
            addRow: model => addRow(model, state, props),
            deleteRow: rowData => deleteRow(rowData, state, props),
            editMode: props.editable.editMode,
            autoSave: props.editable.autoSave,
            sync: () => state.setSaveRequested(true),
        };
    }
    return context;
}

export interface IGridState {
    pagination: IPagination | null;
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
    syncProgress: IProgress | null;
    setSyncProgress: Setter<IProgress | null>;
    needsSave: boolean;
    setNeedsSave: Setter<boolean>;
    isLoading: boolean;
    setIsLoading: Setter<boolean>;
    saveRequested: boolean;
    setSaveRequested: Setter<boolean>;
}

function useGridState<TModel extends object>(
    props: IGridProps<TModel>
): IGridState {
    const [pagination, setPagination] = useState<IPagination | null>(
        props.footer ? getDefaultPagination(props.footer.initialPageSize) : null
    );
    const [sort, setSort] = useState<ISortColumn | null>(null);
    const [filters, setFilters] = useState<IFieldFilter[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [syncProgress, setSyncProgress] = useState<IProgress | null>(null);
    const [dataState, setDataState] = useState<IDataState>({
        totalCount: 0,
        data: [],
    });
    const [isEditing, setIsEditing] = useState(false);
    const [needsSave, setNeedsSave] = useState(false);
    const [editField, setEditField] = useState<IEditField | null>(null);
    const [saveRequested, setSaveRequested] = useState<boolean>(false);

    return {
        pagination,
        setPagination,
        sort,
        setSort,
        filters,
        setFilters,
        isLoading,
        setIsLoading,
        syncProgress,
        setSyncProgress,
        dataState,
        setDataState,
        isEditing,
        setIsEditing,
        needsSave,
        setNeedsSave,
        editField,
        setEditField,
        saveRequested,
        setSaveRequested,
    };
}

function syncDataEffect<TModel extends object>(
    state: IGridState,
    props: IGridProps<TModel>
) {
    const sync = async () => {
        const result = await syncChanges(state, props);
        state.setNeedsSave(false);
        return result;
    };
    if (state.saveRequested) {
        state.setSaveRequested(false);
        sync();
    }
}

function loadDataEffect<TModel extends object>(
    state: IGridState,
    getDataAsync: (
        p: IPagination | null,
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
                    rowNumber: i + 1,
                    uid: uuid(),
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

function updateRow<TModel extends object>(
    rowData: IRowData,
    state: IGridState,
    props: IGridProps<TModel>
): boolean {
    const existingRow = state.dataState.data.find(
        r => r.rowNumber === rowData.rowNumber
    );
    if (!existingRow) {
        throw new Error(`unable to find row with id=${rowData.rowNumber}`);
    }
    existingRow.syncAction = rowData.syncAction;
    existingRow.model = rowData.model;
    state.setNeedsSave(state.needsSave || hasChanged(rowData));

    state.setDataState(state.dataState);

    if (props.editable?.autoSave) {
        state.setSaveRequested(true);
    }

    return true; //success
}

function addRow<TModel extends object>(
    model: TModel,
    state: IGridState,
    props: IGridProps<TModel>
): boolean {
    const data = state.dataState.data;
    const newRow = {
        uid: uuid(),
        model,
        syncAction: SyncAction.added,
        rowNumber: -1,
    };

    if (props.editable?.addToBottom) {
        data.push(newRow);
    } else {
        data.unshift(newRow);
    }

    data.forEach((r, i) => (r.rowNumber = i + 1));
    state.setDataState({ data, totalCount: data.length });

    if (props.editable?.autoSave) {
        state.setSaveRequested(true);
    }

    return true; //success
}

function deleteRow<TModel extends object>(
    rowData: IRowData,
    state: IGridState,
    props: IGridProps<TModel>
): boolean {
    const data = state.dataState.data;
    const existingRow = data.find(r => r.rowNumber === rowData.rowNumber);
    if (!existingRow) {
        throw new Error(`unable to find row with id=${rowData.rowNumber}`);
    }
    existingRow.syncAction = SyncAction.deleted;
    existingRow.model = rowData.model;
    state.setNeedsSave(state.needsSave || hasChanged(rowData));

    data.forEach((r, i) => (r.rowNumber = i + 1));
    state.setDataState({ data, totalCount: data.length });

    if (props.editable?.autoSave) {
        state.setSaveRequested(true);
    }

    return true; //success
}

const setCurrentEditField = (
    editField: IEditField | null,
    state: IGridState
) => {
    if (editField) {
        const row = state.dataState.data.find(
            r => r.rowNumber === editField.rowId
        );
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
    if (state.syncProgress) {
        throw new Error(
            'attempt to call syncChanges when sync already in progress'
        );
    }

    const changes = state.dataState.data
        .filter(r => hasChanged(r))
        .map(r => {
            const result: ISyncData<TModel> = {
                model: r.model,
                rowNumber: r.rowNumber,
                syncAction: r.syncAction,
            };
            return result;
        });
    state.setSyncProgress({
        current: 0,
        total: changes.length,
        message: 'starting sync',
    });

    const applyUpdates = (
        p: IProgress,
        interim?: Array<ISyncDataResult<TModel>>
    ) => _applySyncResults(state, p, interim);

    try {
        const result = await props.editable.syncChanges(changes, applyUpdates);
        _applySyncResults(
            state,
            { current: changes.length, total: changes.length },
            result
        );
        return result;
    } finally {
        state.setSyncProgress(null);
        console.log('done saving');
    }
}

export function _applySyncResults<TModel extends object>(
    state: IGridState,
    progress: IProgress,
    results: Array<ISyncDataResult<TModel>> | undefined
): void {
    state.setSyncProgress(progress);
    if (results) {
        for (let r of results) {
            if (!r.success) {
                continue;
            }
            const index = state.dataState.data.findIndex(
                er => er.rowNumber === r.rowNumber
            );
            if (index < 0) {
                throw new Error(
                    'could not find existing row for the data being saved'
                );
            }
            if (r.syncAction === SyncAction.deleted) {
                state.dataState.data.splice(index, 1);
            } else {
                state.dataState.data[index] = {
                    model: r.model,
                    syncAction: SyncAction.unchanged,
                    rowNumber: r.rowNumber,
                    uid: uuid(),
                };
            }
        }
        state.setDataState(state.dataState);
    }
}
