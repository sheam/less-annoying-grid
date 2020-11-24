/* tslint:disable:no-magic-numbers max-line-length jsx-no-lambda no-empty */
import {mount, ReactWrapper} from 'enzyme';
import * as React from 'react';
import {IPagination} from "../../types";
import * as GridContext from "../../context";
import {Grid} from "../../grid";
import {cols, data, getDataAsync} from "./mock-data";
import {IGridContext} from "../../context";
import {act} from "react-dom/test-utils";

const getByTestId = (c: ReactWrapper, name: string) => c.find(`[data-test="${name}"]`);

function setGridContextData(gridContext: GridContext.IGridContext): void
{
    if( !gridContext.setPagination )
    {
        gridContext.setPagination = jest.fn(); // default implementation
    }
    jest
        .spyOn(GridContext, 'useGridContext')
        .mockImplementation(() => gridContext);
}


//not sure how to wait for the getDataAsync to complete which is called by useEffect...
// it('renders rows of data', async() => {
//     const pagination: IPagination = {
//         currentPage: 1,
//         pageSize: 2,
//     };
//     setGridContextData({pagination});
//
//     const totalCount = data.length;
//     const numColumns = cols.length;
//
//     const gridContext: IGridContext = {
//
//     };
//
//     const component = mount(
//         <Grid
//             columns={cols}
//             getDataAsync={getDataAsync}
//         >
//             {{
//                 toolbar: <div/>,
//                 emptyState: <i>no data</i>,
//                 loadingState: <i>the data is loading</i>,
//             }}
//         </Grid>,
//     );
//
//     // component.setProps({ sortAscLabel: 'asc' })
//     // component.update();
//     await wait(() => {
//         component.update();
//         expect(getByTestId(component, 'data-row')).toHaveLength(data.length+5);
//     });
// });
