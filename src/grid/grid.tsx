/* tslint:disable:jsx-no-multiline-js */
import * as React from 'react';
import { PropsWithChildren } from 'react';
import { createGridContext, GridContext } from './context';
import { Footer } from './header-footer/footer';
import { Header } from './header-footer/header';
import { Row } from './rowData/row';
import { useGridState } from './state';
import { useSyncDataEffect, useLoadDataEffect } from './sync';
import { GridEditMode, IGridProps } from './types-grid';
import { getNonGroupColumns } from './util';
import { PopupEditor } from "./rowData/row-popup-editor";

interface IChildren
{
    children?: {
        toolbar?: JSX.Element;
        emptyState?: JSX.Element;
        loadingState?: JSX.Element;
        savingState?: JSX.Element;
    };
}

export const Grid = <TSummaryModel extends object, TEditModel extends object, TDetailModel extends object>(
    props: IGridProps<TSummaryModel, TEditModel, TDetailModel> & PropsWithChildren<IChildren>
) =>
{
    const state = useGridState(props);

    useLoadDataEffect(state, props);
    useSyncDataEffect(state, props);

    const context = createGridContext(props, state);

    const renderColWidth =
        getNonGroupColumns(props.columns).length +
        (props.renderRowDetail ? 1 : 0);
    const showLoading = state.isLoading && props.children?.loadingState;
    const showSaving = state.syncProgress && props.children?.savingState;
    const showSync = showLoading || showSaving;
    const needExternalEditor = props.editable?.editMode === GridEditMode.external && state.editField;
    const showEmptyState = !showLoading && !state.dataState.data.length && props.children?.emptyState;

    return (
        <GridContext.Provider value={context}>
            <div className="lag-grid">
                {needExternalEditor && <PopupEditor columns={props.columns} />}
                <div hidden={!showSync} className="sync-panel">
                    <div className="sync-panel-content">
                        {showLoading && props.children?.loadingState}
                        {showSaving && props.children?.savingState}
                    </div>
                </div>
                {props.children?.toolbar &&
                    <div className="toolbar" data-test="toolbar">
                        {props.children.toolbar}
                    </div>
                }
                <table>
                    <Header
                        columns={props.columns}
                        sortAscLabel={props.sortAscLabel}
                        sortDescLabel={props.sortDescLabel}
                        unsortedLabel={props.unsortedLabel}
                    />
                    <tbody>
                        {showEmptyState &&
                            <tr>
                                <td colSpan={renderColWidth}>
                                    {props.children?.emptyState}
                                </td>
                            </tr>
                        }
                        {state.dataState.data.map(d =>
                        {
                            // const k = d.rowId;
                            const k = `row-${d.rowId}-${d.syncAction}-${d.validationErrors?.length}`
                            return (
                                <Row
                                    key={k}
                                    columns={props.columns}
                                    data={d}
                                />
                            );
                        })}
                    </tbody>
                    {state.pagination && (
                        <Footer
                            numColumns={renderColWidth}
                            totalCount={state.dataState.totalCount}
                            config={props.footer}
                        />
                    )}
                </table>
            </div>
        </GridContext.Provider>
    );
};
