import * as React from 'react';
import { useGridContext } from '../context';
import { useEffect, useState } from 'react';
import { IRowData } from '../types-grid';

interface IRowDetailTemplateProps<TSummaryModel extends object, TDetailModel extends object>
{
    numColumns: number;
    data: IRowData<TSummaryModel>;
}

export const RowDetailTemplate = <TSummaryModel extends object, TDetailModel extends object>({
    numColumns,
    data
}: IRowDetailTemplateProps<TSummaryModel, TDetailModel>) =>
{
    const { getLoadSingleState, renderRowDetail, getDetailModelAsync } = useGridContext();
    const [detailData, setDetailData] = useState<TDetailModel | null>(null);
    useEffect(() =>
    {
        if (!detailData && data.showDetail)
        {
            if (getDetailModelAsync)
            {
                getDetailModelAsync(data.model).then(detailModel =>
                {
                    setDetailData(detailModel as TDetailModel);
                });
            }
            else
            {
                throw new Error('getDetailModelAsync should always be defined')
            }
        }
    }, [data, data.model, data.showDetail])

    if (!renderRowDetail)
    {
        throw new Error('Can not render row detail if renderRowDetail property is not defined');
    }

    if (!detailData)
    {
        const loadingContent = getLoadSingleState ? getLoadSingleState(data.model) : 'loading';
        return (
            <tr className="template-row" hidden={!data.showDetail}>
                <td colSpan={numColumns}>
                    {loadingContent}
                </td>
            </tr>
        );
    }
    return (
        <tr className="template-row" hidden={!data.showDetail}>
            <td colSpan={numColumns}>
                {renderRowDetail(detailData)}
            </td>
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
