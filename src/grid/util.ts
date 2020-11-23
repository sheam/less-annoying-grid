
export function cloneData<TModel>(model: TModel): TModel
{
    return (JSON.parse(JSON.stringify(model)));
}
