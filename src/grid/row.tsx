/* tslint:disable:jsx-no-multiline-js jsx-no-lambda */
import * as React from 'react';
import {Column, IActionColumn, IColumn, IRowData} from './types';

export interface IRowProps<TModel extends object>
{
    columns: IColumn<TModel>[];
    data: IRowData;
}

export const Row = <TModel extends object>(props: IRowProps<IRowData>) =>
{
    return <div></div>;
    // const allCols = props.columns.flatMap(c => c.type === 'group' ? c.subColumns : c);
    // const uid = props.data.uid;
    // return (
    //     <tr title={`uid=${uid}`}>
    //         {allCols.map(c => {
    //                 if (c.type === 'data')
    //                 {
    //                     return <Cell key={`td-${uid}-${c.name}`} column={c} data={props.data}/>;
    //                 }
    //                 if (c.type === 'action')
    //                 {
    //                     return <ActionCell key={`td-${uid}-${c.name}`} column={c} data={props.data}/>;
    //                 }
    //             })
    //         }
    //     </tr>
    // );
};

interface ICellProps<TModel extends object>
{
    column: IColumn<TModel>;
    data: IRowData;
}

export const Cell = <TModel extends object>({column: {field, hidden, renderDisplay}, data}: ICellProps<TModel>) =>
{
    return (
        <td hidden={hidden}>
            {renderDisplay && renderDisplay(data.model) || ''}
            {/* @ts-ignore */}
            {!renderDisplay && ((data.model as any)[field].toString()) || ''}
        </td>
    );
};

interface IActionCellProps<TModel extends object>
{
    column: IActionColumn<TModel>;
    data: IRowData;
}
export const ActionCell = <TModel extends object>({column, data}: IActionCellProps<TModel>) =>
{
    return (
        <td hidden={column.hidden}>
            {column.actions.map(a =>
                                    <button
                                        className={`action-${a.name}`}
                                        key={`action-${a.name}`}
                                        onClick={() => a.handler(data.model, data.uid, data.dirty === true)}
                                    >
                                        {a.buttonContent}
                                    </button>)}
        </td>
    );
};
