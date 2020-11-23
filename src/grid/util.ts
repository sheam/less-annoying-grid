
export function cloneData<TModel>(model: TModel): TModel
{
    return (JSON.parse(JSON.stringify(model)));
}

//stealing from interwebs until next ES release which is supposed to have UID module
export function uuid(): string
{
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);  // eslint-disable-line
        return v.toString(16);
    });
}
