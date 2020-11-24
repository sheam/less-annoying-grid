import {Column, IDataResult, IFieldFilter, IPagination, ISortColumn} from "../../types";
import {getData as getMockData, IData as IMockData} from "../../../pages/test-grid-page/mock-data";


export interface IData
{
    numVal: number;
    textVal: string;
    enumVal: string;
}

export const cols: Array<Column<IData>> = [
    {
        type: 'data',
        name: 'Number',
        field: 'numVal',
    },
    {
        type: 'data',
        name: 'Text',
        field: 'textVal',
    },
    {
        type: 'data',
        name: 'Enum',
        field: 'enumVal',
    },
];

export const data: IData[] = [
    {
        numVal: 1,
        textVal: 'one',
        enumVal: 'a'
    },
    {
        numVal: 2,
        textVal: 'two',
        enumVal: 'b'
    },
    {
        numVal: 3,
        textVal: 'three',
        enumVal: 'c'
    },
    {
        numVal: 4,
        textVal: 'four',
        enumVal: 'd'
    },
]

export const numIndex = 0, textIndex = 1, enumIndex = 2;

export function getDataAsync(pagination: IPagination, sort: ISortColumn|null, filters: IFieldFilter[]): Promise<IDataResult<IData>>
{
    return new Promise<IDataResult<IData>>(resolve => {
        setTimeout(() => {
            resolve({ totalCount: data.length, data });
        });
    });
}
