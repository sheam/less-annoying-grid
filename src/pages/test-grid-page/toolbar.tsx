import * as React from 'react';
import { FormEvent } from 'react';
import { useGridContext } from '../../grid';
import './styles.css';

interface IToolbarProps {}

export const ToolBar: React.FunctionComponent<IToolbarProps> = () => {
    const {
        setSort,
        filters,
        setFilters,
        resetPagination,
        editingContext,
    } = useGridContext();
    if (!setSort || !setFilters || !resetPagination) {
        throw new Error('configuration error');
    }

    const filterChanged = (e: FormEvent): void => {
        resetPagination();
        const val = (e.target as any).value.toString();
        if (!val) {
            setFilters([]);
        } else {
            setFilters([
                {
                    field: 'four',
                    operator: 'contains',
                    value: val,
                },
            ]);
        }
    };

    let currentFilter = '';
    if (filters && filters.length > 0) {
        currentFilter = filters[0].value;
    }
    const canSave =
        (editingContext?.needsSave || editingContext?.syncProgress) &&
        !editingContext?.validationErrors;
    const saveClicked = async (_: React.MouseEvent<HTMLButtonElement>) => {
        if (!canSave) {
            throw new Error('save clicked when canSave is false');
        }
        if (!editingContext?.sync) {
            throw new Error('save clicked when editing context is null');
        }
        await editingContext.sync();
    };
    const addRowClicked = (_: React.MouseEvent<HTMLButtonElement>) => {
        editingContext?.addRow();
    };
    return (
        <div>
            <h4>Product SKUs</h4>
            <button
                onClick={() => setSort({ field: 'four', direction: 'ASC' })}
            >
                Sort By Col 4 ASC
            </button>
            <button
                onClick={() => setSort({ field: 'four', direction: 'DESC' })}
            >
                Sort By Col 4 DESC
            </button>
            <label>
                Filter:
                <select value={currentFilter} onChange={filterChanged}>
                    <option value="">none</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                </select>
            </label>
            <button
                disabled={!canSave}
                onClick={async e => {
                    await saveClicked(e);
                }}
            >
                Save
            </button>
            <button
                onClick={async e => {
                    await addRowClicked(e);
                }}
            >
                Add
            </button>
        </div>
    );
};
