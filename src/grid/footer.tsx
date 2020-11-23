/* tslint:disable:jsx-no-multiline-js jsx-no-lambda */
import * as React from 'react';
import {useGridContext} from './context';

interface IInternalFooterProps
{
    totalCount: number;
    numColumns: number;
    config?: IFooterProps;
}

export interface IFooterProps
{
    pageSizeOptions?: number[];
    initialPageSize?: number;
    numPageJumpButtons?: number;

    firstLabel?: string;
    lastLabel?: string;
    nextLabel?: string;
    prevLabel?: string;
    itemsName?: string;
}

export const Footer: (props: IInternalFooterProps) => JSX.Element = (props: IInternalFooterProps) =>
{
    const { pagination, setPagination, editingContext } = useGridContext();
    if(!setPagination || !pagination) return <></>;

    const preventPaging = !!(editingContext?.isEditing || editingContext?.needsSave);

    const setPaginationDataSafe = (newCurrentPage: number, pageSize: number) => setPagination({ currentPage: clamp(newCurrentPage, 1, getTotalPages(props.totalCount, pageSize)), pageSize });
    const jumpToPage = (currentPage: number) => setPagination({currentPage, pageSize: pagination.pageSize});

    const totalPages = getTotalPages(props.totalCount, pagination.pageSize);
    const pageSizeOptions = getPageSizeOptions(
        props.config?.pageSizeOptions,
        pagination.pageSize,
        props.totalCount);
    const itemsName = props.config?.itemsName || 'items';
    const nextLabel = props.config?.nextLabel || '>';
    const prevLabel = props.config?.prevLabel || '<';

    return (
        <tfoot title={preventPaging?'paging disabled when the grid contains unsaved data':''}>
            <tr>
                <td colSpan={props.numColumns}>
                    <span className="bn-navigation">
                        <button
                            data-test="prev-button"
                            className="bn-prev-next"
                            title="previous page"
                            disabled={preventPaging}
                            onClick={() => setPaginationDataSafe(
                                pagination.currentPage - 1,
                                pagination.pageSize)}
                        >
                            {prevLabel}
                        </button>
                        {getPageJumpButtons(
                            pagination.currentPage,
                            totalPages,
                            jumpToPage,
                            props.config?.numPageJumpButtons,
                            preventPaging)}
                        <button
                            data-test="next-button"
                            className="bn-prev-next"
                            title="next page"
                            disabled={preventPaging}
                            onClick={() => setPaginationDataSafe(
                                pagination.currentPage + 1,
                                pagination.pageSize)}
                        >
                            {nextLabel}
                        </button>
                    </span>
                    <span className="bn-page-size" title="number of items to display">
                        <select
                            data-test="page-size-select"
                            disabled={preventPaging}
                            value={pagination.pageSize}
                            onChange={e => setPaginationDataSafe(
                                pagination.currentPage,
                                parseInt(e.target.value, 10))}
                        >
                            {pageSizeOptions.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        {itemsName} per page
                    </span>
                    <span className="bn-total-count" data-test="total-label">
                        {props.totalCount ? `${props.totalCount} ${itemsName}` : ''}
                    </span>
                </td>
            </tr>
        </tfoot>
    );
};

function clamp(n: number, min: number, max: number): number
{
    if(n > max)
    {
        return max;
    }
    if(n < min)
    {
        return min;
    }
    return n;
}

function getPageJumpButtons(
    currentPage: number,
    totalPages: number,
    setPage: (n: number) => void,
    numJumpButtons: number|undefined,
    disabled: boolean): JSX.Element
{
    const defaultNumJumpButtons = 7;
    const two = 2;
    numJumpButtons = Math.min(numJumpButtons || defaultNumJumpButtons, totalPages);
    let firstJump = Math.max(1, currentPage - Math.floor(numJumpButtons / two));
    if (firstJump + numJumpButtons > totalPages)
    {
        firstJump = totalPages - numJumpButtons + 1;
    }
    let pageJumps = Array(numJumpButtons).fill(null).map((_, i) => i + firstJump);

    if (pageJumps.indexOf(1) < 0)
    {
        if (pageJumps.length >= numJumpButtons)
        {
            pageJumps = pageJumps.slice(1);
        }
        pageJumps.push(1);
    }
    pageJumps.sort((a, b) => a - b);

    if (pageJumps.indexOf(totalPages) < 0)
    {
        if (pageJumps.length >= numJumpButtons)
        {
            pageJumps.pop();
        }
        pageJumps.push(totalPages);
    }
    pageJumps = pageJumps.sort((a, b) => a - b);

    return (
        <span className="bn-jumps">
            {pageJumps.map(n =>
                               <button
                                   key={n}
                                   data-test="jump"
                                   value={n}
                                   title={n === totalPages ? 'jump to the last page' : `jump to page ${n}`}
                                   className={n === currentPage?'current-page-button':''}
                                   disabled={n === currentPage||disabled}
                                   onClick={e => setPage(parseInt((e.target as any).value, 10))}
                               >
                                   {n}
                               </button>)}
        </span>
    );
}

function getTotalPages(totalCount: number, pageSize: number): number
{
    const pageCount = totalCount / pageSize;
    const pageCountInt = Math.floor(pageCount);
    if (pageCount - pageCountInt === 0)
    {
        return pageCount;
    }

    return pageCountInt + 1;
}

// tslint:disable-next-line:no-magic-numbers
const defaultPageSizeOption = [5, 10, 20, 50, 100];
function getPageSizeOptions(pageSizes: number[]|undefined, currentPageSize: number|undefined, totalItemCount: number): number[]
{
    pageSizes = pageSizes || defaultPageSizeOption;
    pageSizes.push(currentPageSize||10);
    pageSizes = pageSizes.slice(0, 1).concat(pageSizes.slice(1).filter(n => n <= totalItemCount));
    pageSizes = Array.from(new Set(pageSizes));
    return pageSizes.sort((a, b) => a - b);
}
