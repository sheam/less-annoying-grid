import * as React from 'react';
import { useGridContext } from '../context';
import { Column, NonGroupColumn } from '../columns/types';
import { ISortColumn } from '../types-pagination';
import { ElementOrString } from '../types-grid';
import { getNonGroupColumns } from '../util';

export interface IHeaderProps<TSummaryModel extends object>
{
    columns: Array<Column<TSummaryModel>>;

    sortAscLabel?: ElementOrString;
    sortDescLabel?: ElementOrString;
    unsortedLabel?: ElementOrString;
}

export const Header = <TSummaryModel extends object>(props: IHeaderProps<TSummaryModel>) =>
{
    const { sort, setSort, renderRowDetail } = useGridContext();

    function getGroupHeaderCell(c: Column<TSummaryModel>): JSX.Element
    {
        if (c.type === 'field')
        {
            throw new Error('column must not be an Edit Only column');
        }

        if (c.type !== 'group' || !c.subColumns)
        {
            const hide = c.type !== 'display' && c.hidden;
            return (
                <th
                    key={`no-group-${c.name}`}
                    hidden={hide}
                    data-test="group"
                    className={c.className}
                />
            );
        }

        return (
            <th
                colSpan={
                    c.subColumns.filter(s => s.type === 'display' || !s.hidden)
                        .length
                }
                key={`group-${c.name}`}
                data-test="group"
                className={c.className}
            >
                {c.name}
            </th>
        );
    }

    function getHeaderCell(c: NonGroupColumn<TSummaryModel>): JSX.Element
    {
        if (c.type === 'action')
        {
            return (
                <th
                    key={c.name}
                    hidden={c.hidden}
                    data-test="header"
                    className={c.className}
                >
                    {c.name}
                </th>
            );
        }
        const sortable = c.type === 'data' && c.sortable;
        const className = (sortable ? 'sortable' : '') + ' ' + (c.className || '');
        return (
            <th
                key={c.name}
                hidden={c.hidden}
                onClick={() => headerClicked(c)}
                data-test="header"
                className={className.trim()}
                title={c.type === 'data' ? c.field : undefined}
            >
                <span>{c.name}</span>
                {sortable && getSortLabel(c)}
            </th>
        );
    }

    function getSortLabel(c: NonGroupColumn<TSummaryModel>): ElementOrString | null
    {
        if (c.type !== 'data' || !c.sortable)
        {
            return null;
        }

        if (sort?.field === c.field)
        {
            if (sort.direction === 'ASC')
            {
                return (
                    <span className="sort-indicator" data-test="sort-asc">
                        {props.sortAscLabel || 'v'}
                    </span>
                );
            }
            if (sort.direction === 'DESC')
            {
                return (
                    <span className="sort-indicator" data-test="sort-desc">
                        {props.sortDescLabel || '^'}
                    </span>
                );
            }
        }
        return (
            <span className="sort-indicator" data-test="sort-unsorted">
                {props.unsortedLabel || '-'}
            </span>
        );
    }

    function headerClicked(c: NonGroupColumn<TSummaryModel>): void
    {
        if (c.type !== 'data' || !setSort || !c.sortable)
        {
            return;
        }

        let sortCol: ISortColumn = { field: c.field, direction: 'ASC' };
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
    }

    const columns = props.columns.filter(c => c.type !== 'field');

    const hasGroups = !!columns.find(c => c.type === 'group');
    const allCols = getNonGroupColumns(columns);
    return (
        <thead>
            {hasGroups && (
                <tr className="column-groups">
                    {renderRowDetail && <td className="detail-button-col" />}
                    {columns.map(c => getGroupHeaderCell(c))}
                </tr>
            )}
            <tr className="column-headings">
                {renderRowDetail && <td className="detail-button-col" />}
                {allCols.map(c => getHeaderCell(c))}
            </tr>
        </thead>
    );
};
