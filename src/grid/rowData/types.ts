import {Column, IColumn, IRowData} from "../types";

export interface IRowProps<TModel extends object> {
    columns: Column<TModel>[];
    data: IRowData;
}

export interface ICellProps<TModel extends object> {
    column: IColumn<TModel>;
    data: IRowData;
}
