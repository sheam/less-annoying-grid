import * as React from 'react';
import { useRowContext } from '../../grid/grid/rowData/row-context';
import { cloneData } from '../../grid/grid/util';
import { ChangeEvent, KeyboardEvent } from 'react';
import { Direction } from '../../grid/grid/types-grid';

interface ICustomEditorExampleProps {
    field: string;
}

export const CustomEditorExample: React.FunctionComponent<ICustomEditorExampleProps> = ({
    field,
}) => {
    const context = useRowContext();
    const model = cloneData(context.model);

    const changeHandler = (
        e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>
    ) => {
        model[field] = `n-${e.target.value}`;
        context.onChange(model);
    };

    const focusLost = () => {
        context.doneEditing(true, Direction.none);
    };

    const detectSpecialKeys = (
        e: KeyboardEvent<HTMLInputElement> | KeyboardEvent<HTMLSelectElement>
    ) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            context.doneEditing(false, Direction.none);
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            context.doneEditing(true, Direction.none);
        }
        if (e.key === 'Tab') {
            e.preventDefault();
            context.doneEditing(
                true,
                e.shiftKey ? Direction.backward : Direction.forward
            );
        }
    };

    let n = 1;
    const strVal = model[field]?.toString();
    if (strVal) {
        const match = strVal.match(/n-(\d+)/i);
        if (match) {
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
                    onKeyDown={detectSpecialKeys}
                    onBlur={focusLost}
                    onChange={changeHandler}
                />
            </label>
        </div>
    );
};
