import * as React from 'react';
import { useRowContext } from '../../grid';
import { ChangeEvent } from 'react';

interface ICustomEditorExampleProps
{
    field: string;
}

export const CustomEditorExample: React.FunctionComponent<ICustomEditorExampleProps> = ({
    field,
}) =>
{
    const context = useRowContext();
    const model = Object.assign({}, context.rowData.model) as any;
    const focus = context.focusField === field;

    const changeHandler = (
        e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>
    ) =>
    {
        model[field] = `n-${e.target.value}`;
        context.onChange(model);
    };

    const focusLost = () =>
    {
        context.doneEditingField(true);
    };

    const detectSpecialKeys = context.detectSpecialKeys;

    let n = 1;
    const strVal = model[field]?.toString();
    if (strVal)
    {
        const match = strVal.match(/n-(\d+)/i);
        if (match)
        {
            n = parseInt(match[1]);
        }
    }
    return (
        <div className="custom-editor-example">
            <label>
                N-
                <input
                    type="number"
                    value={n}
                    autoFocus={focus}
                    onKeyDown={detectSpecialKeys}
                    onBlur={focusLost}
                    onChange={changeHandler}
                />
            </label>
        </div>
    );
};
