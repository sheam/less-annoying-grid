# less-annoying-grid
An editable data grid that is meant for multiple scenarios.

This isn't meant as a quick way to show data.
Most large projects tend to use grids in a way specific to their data and needs.
So using a grid that works well out of the box always ends up causing pain long term.

This grid is used in a production application with multiple use cases.
So hopefully it can solve most of your needs out of the box. If there is a scenario that is
is needed by your application that is not covered, feel free to submit a pull-request.

For development, there is a less-annoying-grid-samples project which can be linked with this project.

## Testing
### Testing your application using the local version of _less-annoying-grid_
1. In terminal, cd to _less-annoying_grid_ directory.
1. Run `react` and `react-dom` from devDependencies.
1. Run `rm -rf node_modules && yarn && yarn link`
1. Run `yarn watch`
1. **cd** to your app directory
1. Run `yarn link less-annoying-grid`
1. Link the app's react version `cd node_modules/react`
1. **cd** back to module directory
1. Complete the link `yarn link react`
1. Run your application

**Note**: you will not be able to run the unit tests for the module until the packages
are put back into the `devDependencies`. See below.

### When you are done testing
1. From module directory
1. Add `react` and `react-dom` back to devDependencies.
1. Run `rm -rf node_modules && yarn install`
