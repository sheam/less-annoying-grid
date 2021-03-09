import { Column } from '../..';
import { IRowData } from '../types-grid';

export interface IRowProps<TSummaryModel extends object>
{
    columns: Column<TSummaryModel>[];
    data: IRowData<TSummaryModel>;
}
