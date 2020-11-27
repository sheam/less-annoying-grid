import { Column } from '../..';
import { IRowData } from '../types-grid';

export interface IRowProps<TModel extends object>
{
    columns: Column<TModel>[];
    data: IRowData<TModel>;
}
