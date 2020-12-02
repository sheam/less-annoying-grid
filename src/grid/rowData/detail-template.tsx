import * as React from 'react';
import { useGridContext } from '../context';

interface IRowDetailTemplateProps
{
    show: boolean;
    numColumns: number;
}

export const RowDetailTemplate: React.FunctionComponent<IRowDetailTemplateProps> = ({
    show,
    numColumns,
    children,
}) =>
{
    return (
        <tr className="template-row" hidden={!show}>
            <td colSpan={numColumns + 1}>{children}</td>
        </tr>
    );
};

interface IRowDetailTemplateTriggerCellProps
{
    rowId: string;
    isShowing: boolean;
}

export const RowDetailTemplateTriggerCell: React.FunctionComponent<IRowDetailTemplateTriggerCellProps> = ({
    rowId,
    isShowing,
}) =>
{
    const {
        showDetailForRow,
        rowDetailButtonHiddenContent,
        rowDetailButtonShowingContent,
    } = useGridContext();
    const toggle = () =>
    {
        if (!showDetailForRow)
        {
            throw new Error('showDetailForRow must be defined');
        }
        const newShowState = !isShowing;
        showDetailForRow(rowId, newShowState);
    };

    const buttonClass = isShowing ? 'showing' : 'hidden';
    const buttonContent = isShowing
        ? rowDetailButtonShowingContent || 'v'
        : rowDetailButtonHiddenContent || '>';
    return (
        <td className="template-trigger">
            <button onClick={toggle} className={buttonClass}>
                {buttonContent}
            </button>
        </td>
    );
};
