/* tslint:disable:jsx-no-multiline-js */
import * as React from 'react';
import {PropsWithChildren, useEffect, useState} from 'react';
import {GridContext, IGridContext} from './context';
import {Footer, IFooterProps} from './footer';
import './grid.css';
import {Header} from './header';
import {IRowProps, Row} from './row';
import {Column, IDataResult, IDataState, IFieldFilter, IPagination, IRowData, ISortColumn} from './types';

interface IGridProps<TModel extends object>
{
    columns: Array<Column<TModel>>;
    footer?: IFooterProps;

    sortAscLabel?: JSX.Element | string;
    sortDescLabel?: JSX.Element | string;

    getDataAsync: (pagination: IPagination, sort: ISortColumn|null, filters: IFieldFilter[]) => Promise<IDataResult<TModel>>;

    editabl?: IGridEditable<TModel>;
}

interface IGridEditable<TModel extends object>
{
    editMode: 'inline' | 'inline-auto' | 'popup-auto';
    updateModelAsync: (model: TModel) => Promise<TModel>;
    addModelAsync: (model: TModel) => Promise<TModel>;
    deleteModelAsync: (model: TModel) => Promise<void>;
}

interface IChildren
{
    children?: {
        toolbar?: JSX.Element;
        emptyState?: JSX.Element;
        transmittingState?: JSX.Element;
    };
}


export const Grid = <TModel extends object>(props: IGridProps<TModel> & PropsWithChildren<IChildren>) =>
{
    const [pagination, setPagination] = useState<IPagination>({currentPage: 1, pageSize: 10});
    const [sort, setSort] = useState<ISortColumn|null>(null);
    const [filters, setFilters] = useState<IFieldFilter[]>([]);
    const [transmitting, setTransmitting] = useState<boolean>(false);
    const [dataState, setDataState] = useState<IDataState<TModel>>({ totalCount: 0, data: [] });

    useEffect(() => {
        const fetch = async () => {
            const d = await props.getDataAsync(pagination, sort, filters);
            const newState: IDataState<TModel> = {
                totalCount: d.totalCount,
                data: d.data.map(m =>
                                 {
                                     const result: IRowData = {
                                         dirty: false,
                                         model: m,
                                         uid: uuid(),
                                     };
                                     return result;
                                 }),
            };
            setDataState(newState);
            setTransmitting(false);
        };

        setTransmitting(true);
        // noinspection JSIgnoredPromiseFromCall
        fetch();
    }, [pagination, sort, filters]);

    const context: IGridContext = {
        pagination,
        sort,
        filters,
        transmitting,
        setPagination,
        setSort,
        setFilters,
        setTransmitting,
    };

    const totalColumns = props.columns.flatMap(c => c.type === 'group' ? c.subColumns : c).length;
    const showTransmitting = transmitting && props.children?.transmittingState;

    return (
        <GridContext.Provider value={context}>
            <div className="bn-grid">
                <table>
                    <Header
                        columns={props.columns}
                        toolbar={props.children?.toolbar}
                        sortAscLabel={props.sortAscLabel}
                        sortDescLabel={props.sortDescLabel}
                    />

                    <tbody>
                    {showTransmitting &&
                     <tr>
                         <td colSpan={totalColumns}>
                             {props.children?.transmittingState}
                         </td>
                     </tr>
                    }
                    {!showTransmitting && !dataState.totalCount && props.children?.emptyState &&
                     <tr>
                         <td colSpan={totalColumns}>
                             {props.children.emptyState}
                         </td>
                     </tr>
                    }
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

function uuid(): string
{
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        // tslint:disable-next-line:no-bitwise no-magic-numbers one-variable-per-declaration
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
