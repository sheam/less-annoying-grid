/* tslint:disable:jsx-no-multiline-js */
import * as React from 'react';
import { PropsWithChildren, useEffect } from 'react';
import { createGridContext, GridContext } from './context';
import { Footer } from './header-footer/footer';
import { Header } from './header-footer/header';
import { Row } from './rowData';
import { useGridState } from './state';
import { loadDataEffect, syncDataEffect } from './sync';
import { IGridProps } from './types-grid';

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

    const context = createGridContext(props, state);

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
