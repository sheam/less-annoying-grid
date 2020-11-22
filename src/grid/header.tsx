/* tslint:disable:jsx-no-multiline-js jsx-no-lambda */
import * as React from 'react';
import {useGridContext} from './context';
import {Column, IActionColumn, IColumn, ISortColumn} from './types';

export interface IHeaderProps<TModel extends object>
{
    columns: Array<Column<TModel>>;
    toolbar?: JSX.Element;

    sortAscLabel?: JSX.Element | string;
    sortDescLabel?: JSX.Element | string;
}

type ActionOrDataCol<TModel extends object> = IColumn<TModel>|IActionColumn<TModel>;

export const Header = <TModel extends object>(props: IHeaderProps<TModel>) =>
{
    const {sort, setSort} = useGridContext();

    const getGroupHeaderCell = (c: Column<TModel>): JSX.Element =>
    {
        if (c.type !== 'group' || !c.subColumns)
        {
            return <th key={`no-group-${c.name}`} hidden={c.hidden} data-test="group"/>;
        }

        return (
            <th colSpan={c.subColumns.filter(s => !s.hidden).length} key={`group-${c.name}`} data-test="group">
                {c.name}
            </th>
        );
    };

    const getHeaderCell = (c: IColumn<TModel>|IActionColumn<TModel>): JSX.Element =>
    {
        if (c.type === 'action')
        {
            return (
                <th key={c.name} hidden={c.hidden} data-test="header">
                    {c.name}
                </th>
            );
        }
        return (
            <th key={c.name} hidden={c.hidden} onClick={() => headerClicked(c)} data-test="header">
                <span>
                    {c.name}
                </span>
                {getSortLabel(c)}
            </th>
        );
    };

    const getSortLabel = (c: IColumn<TModel>): JSX.Element | string | null =>
    {
        if (sort?.field !== c.field || !sort?.direction)
        {
            return null;
        }
        if (sort.direction === 'ASC')
        {
            return <span className="sort-indicator" data-test="sort-asc">{props.sortAscLabel || 'v'}</span>;
        }
        if (sort.direction === 'DESC')
        {
            return <span className="sort-indicator" data-test="sort-desc">{props.sortDescLabel || '^'}</span>;
        }
        return null;
    };

    const headerClicked = (c: IColumn<TModel>): void =>
    {
        if (!c.sortable || !c.field || !setSort)
        {
            return;
        }

        let sortCol: ISortColumn = {field: c.field, direction: 'ASC'};
        if (sort?.field === c.field)
        {
            if (sort.direction === 'ASC')
            {
                sortCol.direction = 'DESC';
            }
            if (sort.direction === 'DESC')
            {
                setSort(null);
                return;
            }
        }
        setSort(sortCol);
    };

    const columns = props.columns;

    const hasGroups = !!columns.find(c => c.type === 'group');
    // @ts-ignore
    const allCols: ActionOrDataCol<TModel>[] = columns.flatMap(c => c.type === 'group' ? c.subColumns : c).filter(c => c?.type === 'action'|| c?.type === 'data');
    return (
        <thead>
        {
            props.toolbar &&
            <tr className="toolbar" data-test="toolbar">
                <th colSpan={allCols.length}>
                    {props.toolbar}
                </th>
            </tr>
        }
        {
            hasGroups &&
            <tr className="column-groups">
                {
                    columns.map(c => getGroupHeaderCell(c))
                }
            </tr>
        }
        <tr className="column-headings">
            {allCols.map(c => getHeaderCell(c))}
        </tr>
        </thead>
    );
};
