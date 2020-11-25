import { Column, IDataColumn } from '../columns/column-types';
import { IRowData } from '../grid/types';

export interface IRowProps<TModel extends object> {
    columns: Column<TModel>[];
    data: IRowData;
}

export interface ICellProps<TModel extends object> {
    column: IDataColumn<TModel>;
    data: IRowData;
}
