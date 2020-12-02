import { cloneData } from "../util";
import { IDataResult, IFieldFilter, IPagination, ISortColumn } from "../types-pagination";

export interface IData
{
    key: number;
    name: string;
    age: number;
    eyeColor: string;
}

export function update(model: IData): IData
{
    const index = _data.findIndex(m => m.key === model.key);
    if (index < 0)
    {
        throw new Error(`Could not find data with key=${model.key}`);
    }

    const result = cloneData(model);
    _data[index] = result;
    return result;
}

export function getData(
    pagination: IPagination | null,
    sort: ISortColumn | null,
    filters: IFieldFilter[]
): IDataResult<IData>
{
    const compare = (a: IData, b: IData): number =>
    {
        if (!sort) return 0;

        const aVal = (a as any)[sort.field].toString();
        const bVal = (b as any)[sort.field].toString();
        let compareResult = 0;
        if (aVal < bVal)
        {
            compareResult = -1;
        }
        if (aVal > bVal)
        {
            compareResult = 1;
        }
        if (sort.direction === 'DESC')
        {
            compareResult *= -1;
        }
        return compareResult;
    };

    let data = cloneData(_data);
    data = sort ? data.sort(compare) : data;

    if (filters)
    {
        for (const f of filters)
        {
            if (f.operator !== 'eq')
            {
                throw new Error(`Operator '${f.operator}' is not supported by mock data`);
            }
            data = data.filter(x => (x as any)[f.field] === f.value);
        }
    }

    if (pagination)
    {
        const skip = (pagination.currentPage - 1) * pagination.pageSize;
        return {
            data: data.slice(skip, skip + pagination.pageSize),
            totalCount: data.length,
        };
    }
    return {
        data,
        totalCount: data.length,
    };
}

// export function updateData(model: IData): IData
// {
//     const index = _data.findIndex(x => x.key === model.key);
//     if (index < 0)
//     {
//         throw new Error(`could not find data with key '${model.key}'`);
//     }
//     _data[index] = model;
//     return model;
// }

export function addData(model: IData): IData
{
    model.key = _data.length + 1;
    _data.push(model);
    return model;
}

// export function deleteData(model: IData)
// {
//     const index = _data.findIndex(x => x.key === model.key);
//     if (index < 0)
//     {
//         throw new Error(`could not find data with key '${model.key}'`);
//     }
//     _data.splice(index, 1);
// }

let _data: IData[];

export function resetData(totalCount: number)
{
    const result: IData[] = [];
    for (let i = 0; i < totalCount; i++)
    {
        result.push({
            name: `name-${i + 1}`,
            key: i + 1,
            age: Math.round(Math.random() * 100),
            eyeColor: ['brown', 'blue', 'green', 'red'][Math.round(Math.random() * 3)]
        });
    }
    _data = result;
}

export function getDataAsync(
    pagination: IPagination | null,
    sort: ISortColumn | null,
    filters: IFieldFilter[]
): Promise<IDataResult<IData>>
{
    return new Promise<IDataResult<IData>>(resolve =>
    {
        resolve(getData(pagination, sort, filters));
    });
}
