export interface IFieldFilter
{
    field: string;
    value: string;
    operator: 'eq' | 'ne' | 'gt' | 'ge' | 'lt' | 'le' | 'contains';
}

export interface ISortColumn
{
    field: string;
    direction: 'ASC' | 'DESC';
}

export interface IPagination
{
    currentPage: number;
    pageSize: number;
}

export interface IDataResult<TSummaryModel extends object>
{
    totalCount: number;
    data: TSummaryModel[];
}
