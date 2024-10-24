# The Less Annoying Grid

**Note:** I am no longer maintaining this package. I have switched to using [Tanstack Table](https://tanstack.com/table/latest). If someone wants to to take this over, let me know. 

An editable data grid that is meant for multiple scenarios.

This isn't meant as a quick way to show data.
Most large projects tend to use grids in a way specific to their data and needs.
So using a grid that works well out of the box always ends up causing pain long term.

However, it does allow you to quickly create a dynamic grid with very little configuration.
But the flexibility is there for you later, as your needs evolve.

This grid is used in a production application with multiple use cases.
So hopefully it can solve most of your needs out of the box. If there is a scenario that is needed by your application that is not covered, feel free to submit a pull-request.

For development, there is a less-annoying-grid-samples project which can be linked with this project.

# Usage
## Grid
The `Grid` component is your starting point. It is configured with both children and props.

```typescript jsx
<Grid
    columns={barrelsGridColumns}
    getDataAsync={fetch}
>
    {{
        loadingState: <i>loading...</i>,
        emptyState: <i>no barrels in system...</i>,
    }}
</Grid>
```

### Children
| Name            | Type | Required | Description
|-----------------|------|----------|------------------------------------------------------
| savingState     | JSX  | no       | renders while the grid is saving data
| loadingState    | JSX  | no       | renders while the grid is loading
| emptyState      | JSX  | no       | renders when the grid has no data
| toolbar         | JSX  | no       | rendered above data, has access to `useGridContext()`

### Props
| Name                          | Type                   | Required | Description
|-------------------------------|------------------------|----------|-----------------------------------------
| getDataAsync                  | function               | yes      | Gets data grid will display.
| columns                       | Column[]               | yes      | Array of column definitions.
| footer                        | IFooterProps           | no       | Properties for footer. No footer if not present.
| sortAscLabel                  | JSX / string           | no       | Default = `^`. Shows on column header when grid is sorted (ascending) by that column.
| sortDescLabel                 | JSX / string           | no       | Default = `v`. Shows on column header when grid is sorted (descending) by that column.
| unsortedLabel                 | JSX / string           | no       | Default = `-`. Shows on a _sortable_ column, when grid is _not_ sorted by that column.
| renderRowDetail               | (model) => JSX         | no       | Content for an _accordion_ section with details that does not fit in columns.
| getDetailModelAsync           | (model) => detailModel | no       | If supplied, the model will be fetched using this callback when the details are shown.
| getLoadSingleState            | (model) => JSX / string| no       | Will be rendered inline when loading a model for editing or for the detail expansion.
| rowDetailButtonShowingContent | JSX / string           | no       | Default = `v`. Button to show the extra row details in accordion.
| rowDetailButtonHiddenContent  | JSX / string           | no       | Default = `^`. Button to hide the extra row details in accordion.
| editable                      | IGridEditConfig        | no       | Properties pertaining to editing functionality of the grid. Presence enables editing functionality.
| pushRoute                     | (route) => void        | no       | A callback provided to column actions for routing within your application.

## Further description of types and callbacks
### getDataAsync
`(pagination: IPagination, sort: ISortColumn, filters: IFieldFilter[]) => Promise<IDataResult<TModel>>`

This callback is called when the grid needs to fetch data.
You can return static data, data already loaded, or fetch data over a network and return it.
See more information on the types used below.

### getDetailModelAsync
`getDetailModelAsync?: (model: TSummaryModel) => Promise<TDetailModel>;`

When the row details are shown, by default the detail panel just has access to the summary model.
To help to keep your summary model light, then you can have a different
detailed model that will be loaded on demand, using a heavier model, and a different endpoint.

### IPagination
Used for passing a filter to `getDataAsync` to indicate how the returned data should be paginated.
- **currentPage** - the current page of data requested.
- **pageSize** - the size of the pages configured for the grid.

### IFieldFilter
Used for passing a filter to `getDataAsync` to indicate how the returned data should be filtered.
Also used to tell the grid which filters via the _gridContext_ (i.e., from toolbar).
- **field** -  (string) name of the field to filter on
- **value** -  (string) filter value
- **operator** -  (string) `'eq' | 'ne' | 'gt' | 'ge' | 'lt' | 'le' | 'contains'`

### ISortColumn
Used for passing a filter to `getDataAsync` to indicate how the returned data should be sorted.
- **field** - name (string) of the field to filter on
- **direction** - `'ASC' | 'DESC'`

### IFooterProps
Properties for configuring the appearance and behaviour of the grids footer.
- **pageSizeOptions** - (number[]) _optional_ list of options for the page size of the grid
- **initialPageSize** - (number) _optional_ initial pages size. Should exist in the `pageSizeOptions` list.
- **numPageJumpButtons** - (number) _optional_ number of page jump buttons shown on the footer besides the _next_ and _previous_ buttons.
- **nextLabel** - (string) Default = `>`. Text or element to put in the button to trigger loading next page of data.
- **prevLabel** - (string or JSX.Element) Default = `<`. Text or element to put in the button to trigger loading previous page of data.
- **itemsName** - (string or JSX.Element) Default = `items'. For text displaying the number of items in grid, and in page.

### SyncAction
Enum to indicate the state of data in a row.

### ISyncData
Information about data syncing data.
- **model** - (TModel) the data model to sync/save.
- **rowId** - the unique ID (not row number) of the row being synced. Must appear in the result.
- **syncAction** - (SyncAction) indicates what needs to happen with this data item (i.e., add, delete, etc)

### ISyncDataResult
Details on the results of saving data.
- **model** - (TModel) the data model to sync/save.
- **rowId** - the unique ID (not row number) of the row being synced. Must appear in the result.
- **syncAction** - (SyncAction) indicates what needs to happen with this data item (i.e., add, delete, etc)
- **success** - (boolean) true if synced successfully.
- **error** - (string) if success === false, then details of the failure should appear in hear.

### IProgress
Used for reporting the progress of a save or load.
- **current** - number of items currently processed.
- **total** - the total number of items to process, including processed and unprocessed.
- **message** - optional message to be displayed until the next progress update.

### IGridEditConfig
Properties for defining the editing behaviour of the grid.
- **editMode** - Required. `GridEditMode.inline` or `GridEditMode.external`. Inline edits data in cells, similar to Excel. External edits using a popup dialog.
- **autoSave** - (boolean), default = false. Set to true if the grid should edit each time a field is edited. Set to false if you will be providing a save button in your toolbar, or edit dialog.
- **addToBottom** - (boolean), default = false. Set to true if new rows should be added at the bottom instead of the top.
- **modelTypeName** - (string), required. The name of the data you are modeling. Used for confirmation dialogs and editor dialog titles.
- **modelEditor** - (JSX.Element), optional. If the `editMode` is _external_ this customer element can be used to edit the row's data.
                    The `useRowContext()` hook can be used to access the rows data and functionality.
                    If the editMode is _external_ and this arg is not present an editing dialog will be auto generated with all fields.
                    See documentation on building a custom editor.
- **syncChanges** - callback for saving the data. See below for more details
- **getEditModelAsync** - callback for loading a different model for an external editor.

### syncChanges
`(changes: Array<ISyncData<TModel>>, updateProgress: (progress: IProgress, interimResults?: Array<ISyncDataResult<TModel>>) => void ) => Promise<Array<ISyncDataResult<TModel>>>;`

- **changes** - (ISyncData) A list of data items that need to be saved. See above for definition of ISyncData.
- **updateProgress** - a _optional_ callback which can be used to update the saving progress. Useful for informing the user of progress.
                       The `progress: IProgress` argument is required.
                       The `iterimResults: ISyncDataResult[]` argument is optional, and allows the grid to start processing save results sooner.
                       If it is not provided, all the results will just be processed from the return value of the function.
- **returns** - The returned promise should return a list of results which corresponds to `changes` parameter.  Results should be matched to input via matching `RowId`

### getEditModelAsync
`(model: TSummaryModel) => Promise<TEditModel>`

By default, the model that the external editor uses is the summary model from the grid.
If the model needed for editing is more extensive, then you can use this to fetch a more detailed model from a different endpoint.
This helps to keep your summary model light for faster loads, and reduced backend stress.
This function is _not_ supported for inline editing.

## Column Definitions
Columns essentially describe how your data is represented in the grid.
There are multiple types of columns that can be used
### IDataColumn
- **type** - 'data'
- **name** - (string) name of the column
- **field** - (string) field of model to display/edit.
- **hidden** - (boolean) default = false.
- **sortable** (boolean) default = false.
- **editable** (ColumnEditorType) The type of editor for the column.
- **renderDisplay** - (`(model) => JSX|string`) An optional parameter.
                    Returns a JSX element or string representing the value of the field.
                    If no present, the raw value of the field will be shown.
- **validator** - (`(model) => IValidationError[]`) an option function which provides validation errors after the cell is edited.
                  Data can not be saved if there are validation errors.
                  See the section below.
- **defaultValue** - (`any` or `() => any`) Optionally provides a default value for the field when adding new rows.
                     Can also be a function which returns a default value.
- **className** - an optional name of class to add to the `<td>` element.

#### Validators
Validators can be used to validate edited column data.
There are number of built in validators that can be used, as well custom validators can be created.
The validators are aggregated inside a `validator` call.
```typescript
import {validate as v} from 'less-annoying-grid';

const myNumericValidator = v.validate(v.min(5), v.max(50), v.required());
```

##### List of built in validators
- **min** - ensures the value is equal to or greater than argument supplied.
- **max** - ensures the value is equal to or less than argument supplied.
- **max** - maximum numeric value or date.
- **required** - use if this field is _not_ allowed to be null or empty
- **before** - ensures that a date occurs before the given argument.
- **after** - ensures that a date occurs after the given argument.
- **maxLen** - ensures that string length does not exceed the given argument.
- **minLen** - ensures that string length is not less than the given argument.

##### Custom validator
A _Validator_ is a function with the following signature.
`myValidator(dataValue: any) => string|null`.
The custom validator should return a string if there is a validation issue, and `null` if validation passes.
To create a custom validator, create a function (which takes parameters if needed) and returns a _Validator_ which can be used later to validate date.
```typescript
function containsWord(word: string): (value: any) => string|null
{
   return (text: string) => {
      if(text) {
          return text.indexOf(word) >= 0;
      }
      return false;
   };
}
```
Now you validator can be used as `validator: v.validate(minLen(10), containsWord('hi')),`.

#####

### IDisplayColumn
Display columns are not sortable or editable.
- **type** - 'display'
- **name** - (string) name of the column
- **hidden** - (boolean) default = false.
- **className** - an optional name of class to add to the `<td>` element.
- **renderDisplay** - (`(model) => JSX|string`) An optional parameter.
  Returns a JSX element or string representing the value of the field.
  If no present, the raw value of the field will be shown.

### IColumnGroup
A grouping of columns to appear together.
An example would be a column group called _Quantity_ with sub columns for _Current_ and _On Order_.
- **type** - 'group'
- **name** - (string) name of the column group
- **hidden** - (boolean) default = false.
- **className** - an optional name of class to add to the `<td>` element.
- **subColumns** - a list of columns to appear as part of the group.

### IActionColumn
A column that displays buttons for actions that can be performed on the row.
- **type** - 'action'
- **name** - (string) name of the column
- **hidden** - (boolean) default = false.
- **className** - an optional name of class to add to the `<td>` element.
- **actions** - a list of actions to be rendered.

#### Action
Actions can be one of the following types.

##### buttonState
`(data: TModel, rowId: string, currentSyncAction: SyncAction) => ActionStatus`
A function used to determine what the state of the button should be.
- **data** - (TModel) the data for the row which can be used to determine what the state of the button should be.
- **rowId** - (string) the unique identifier of the row.
- **currentSyncAction** - (SyncAction) the enum stating what sync action is pending for the row.
- **returns** - An ActionStatus value stating if the button should be enabled, disabled, or hidden.

##### IActionEdit
- **type** - 'edit'
- **name** - (string) default = 'Edit'. Used for generating a class on the button.
- **buttonContent** - (JSX / string). The content to render inside the button.
  If not present, the name is displayed as the button content.
- **buttonState** - see buttonState function description above.

##### IActionDelete
- **type** - 'delete'
- **name** - (string) default = 'Edit'. Used for generating a class on the button.
- **buttonContent** - (JSX / string). The content to render inside the button.
  If not present, the name is displayed as the button content.
- **buttonState** - optional. see buttonState function description above.
- **confirm** - Default = false. If true a simple _confirm_ dialog confirms the deletion.
                If a function `(model, syncAction) => Promise<boolean>` can be supplied so that you can provide their own confirmation prompt.

##### IActionCustom
- **type** - 'custom'
- **name** - (string) default = 'Edit'. Used for generating a class on the button.
- **buttonContent** - (JSX / string). The content to render inside the button.
  If not present, the name is displayed as the button content.
- **buttonState** - optional. see buttonState function description above.
- **handler** - The callback which implements the behavior for the button.
                `(data: TModel, rowId: string, currentSyncAction: SyncAction, pushRoute?: (route: string) => void, => Array<ISyncData<TModel>>`.
                The _pushRoute_ is the same callback provided as a _prop_ to the `Grid` element.
                This is useful if your custom action needs to navigate to a route within your application.
                The return value is a list of syncData. If provided the sync actions will be executed when the function is complete.

## Column Editors
There are different type of editors that can be used for cells.
There are a number of built in editors, or you can build a custom one.
The column editors are used when the grid is using _inline_ edit mode,
or the auto-generate _external_ editor.
If you are using a custom model editor, then these will not be used.

### IEditorNumber
- **type** - 'number'
- **min** - (number) optionally prevent the numeric value from being lower than the given value.
- **max** - (number) optionally prevent the numeric value from exceeding the given value.
- **step** - (number) step value on the numeric input (for using up/down arrows to select value).

### IEditorDate
- **type** - 'date'
- **startRange** - (date) optionally prevent the date value from occurring before the given date.
- **endRange** - (date) optionally prevent the date value from occurring after the given date.

### IEditorValues
- **type** - 'values'
- **subType** - `'number'|'string'` the type of values available to select
- **values** - (`{ text: string; value: any }[]`) a list of tuple values containing display _text_ and a _value_.

### IEditorCustom
- **type** - 'custom'
- **editor** - (JSX) A react element for editing a value. The component can use the `useRowContext()` to access the model.

**example**
```typescript jsx
import * as React from 'react';
import { useRowContext } from 'less-annoying-grid';
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
```

## Building a Toolbar for Use With Grid
If your grid needs a toolbar, you can use any React component.
The toolbor component has access to the grid behavior and functionality via the grid context,
which can be attained using the `useGridContext()` hook.

**example**
```typescript jsx
import * as React from 'react';
import { FormEvent } from 'react';
import { useGridContext } from 'less-annoying-grid';
import './styles.css';

interface IToolbarProps { }

export const ToolBar: React.FunctionComponent<IToolbarProps> = () =>
{
    const {
        setSort,
        filters,
        setFilters,
        resetPagination,
        editingContext,
    } = useGridContext();
    if (!setSort || !setFilters || !resetPagination)
    {
        throw new Error('configuration error');
    }

    const filterChanged = (e: FormEvent): void =>
    {
        resetPagination();
        const val = (e.target as any).value.toString();
        if (!val)
        {
            setFilters([]);
        } else
        {
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
    if (filters && filters.length > 0)
    {
        currentFilter = filters[0].value;
    }
    const canSave =
        (editingContext?.needsSave || editingContext?.syncProgress) &&
        !editingContext?.validationErrors;
    const saveClicked = async (_: React.MouseEvent<HTMLButtonElement>) =>
    {
        if (!canSave)
        {
            throw new Error('save clicked when canSave is false');
        }
        if (!editingContext?.sync)
        {
            throw new Error('save clicked when editing context is null');
        }
        await editingContext.sync();
    };
    const addRowClicked = (_: React.MouseEvent<HTMLButtonElement>) =>
    {
        editingContext?.addRow();
    };
    const cancelClicked = (_: React.MouseEvent<HTMLButtonElement>) =>
    {
        editingContext?.revertAll();
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
                onClick={async e =>
                {
                    await saveClicked(e);
                }}
            >
                Save
            </button>
            <button
                disabled={!editingContext?.needsSave}
                onClick={async e =>
                {
                    await cancelClicked(e);
                }}
            >
                Cancel Changes
            </button>
            <button
                onClick={async e =>
                {
                    await addRowClicked(e);
                }}
            >
                Add
            </button>
        </div>
    );
};
```

## Hooks
For some of your custom components such as toolbars, and custom editors you can make use of the following Hooks.

### useGridContext
The main purpose of this is for implementing a custom toolbar.
The grid context allows you to:
- read and set pagination state
- read and set sorting state
- read and apply filters
- determine if the grid is loading

There is additional functionality exposed, but will likely be deprecated going forward, as the API evolves.

The context returned by the hook is:
```typescript
interface IGridContext<TModel extends object>
{
    pagination?: IPagination | null;
    setPagination?: Setter<IPagination>;
    resetPagination?: () => void;

    sort?: ISortColumn | null;
    setSort?: Setter<ISortColumn | null>;

    filters?: IFieldFilter[];
    setFilters?: Setter<IFieldFilter[]>;

    isLoading?: boolean;

    //ignore other exposed properties
}
```

### useRowContext
The main purpose of this is for implementing a custom editor.
The context returned by the hook is:
```typescript
interface IRowContext<TModel extends object>
{
    rowData: IRowData<TModel>
    onChange: (model: any) => void;
    doneEditingField: (commitChanges: boolean, direction?: Direction) => void;
    doneEditingModel?: (commitChanges: boolean, finalModel?: any) => void;
    detectSpecialKeys?: (e: KeyboardEvent<HTMLInputElement> | KeyboardEvent<HTMLSelectElement>) => void;
    focusField?: string | null;
    isAdd: boolean;
}
```

- **rowData** - data for the row
- **onChange** - call when data in the editor has changed.
- **doneEditingField** - call when you are done editing a field. Can trigger a save, if the _autosave_ property is set.
- **doneEditingModel** - call when you are done editing a model (for custom external editors). Triggers a save.
- **detectSpecialKeys** - call on keyboard events in your editor to determine editing should end via keystroke (i.e, ESC, Enter, Tab);
- **focusField** - access to the field which should currently be focused.
- **isAdd** - true if this is this editor instance is for a newly added model.

# Development
## Testing
**Note**: there is now a script called `link-for-testing.sh` which will do the linking and unlinking for you.
### Testing your application using the local version of _less-annoying-grid_
1. In terminal, cd to _less-annoying_grid_ directory.
1. Remove `react` from devDependencies.
1. Run `rm -rf node_modules && yarn && yarn link`
1. **cd** to your app directory
1. Run `yarn link less-annoying-grid`
1. Link the app's React version `cd node_modules/react && yarn link`
1. **cd** back to module directory
1. Complete the link `yarn link react`
1. Run `yarn watch`
1. Run your application

**Note**: you will not be able to run the unit tests for the module until the packages
are put back into the `devDependencies`. See below.

### When you are done testing
1. From module directory
1. Add `react` back to devDependencies.
1. Run `rm -rf node_modules && yarn install`

## Publish to NPM
1. Commit all work. Do not change version number in the _package.json_, next step will take care of that.
1. `npm version <new version number>`
1. `npm login`
1. `npm publish`
1. `git push`
