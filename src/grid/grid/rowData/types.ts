import { Column, IDataColumn } from '../columns/types';
import { IRowData } from '../types-grid';

export interface IRowProps<TModel extends object> {
    columns: Column<TModel>[];
    data: IRowData;
}

export interface ICellProps<TModel extends object> {
    column: IDataColumn<TModel>;
    data: IRowData;
}
