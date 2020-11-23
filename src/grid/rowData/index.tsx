import {useGridContext} from "../context";
import * as React from "react";
import {IRowProps} from "./types";
import {RowReadOnly} from "./row-readonly";
import {RowInlineEdit} from "./row-inline-edit";

export const Row = <TModel extends object>(props: IRowProps<TModel>) => {
    const {editingContext} = useGridContext();
    if (!editingContext) {
        return <RowReadOnly {...props} />;
    }

    if (editingContext.editMode === "inline") {
        return <RowInlineEdit {...props} />
    }

    throw new Error('unhandled edit mode');
};
