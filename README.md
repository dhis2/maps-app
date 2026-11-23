![React 18](https://img.shields.io/badge/react-18-blue)
This project was bootstrapped with [DHIS2 Application Platform](https://github.com/dhis2/app-platform).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner and runs all available tests found in `/src`.<br />

See the section about [running tests](https://platform.dhis2.nu/#/scripts/test) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
A deployable `.zip` file can be found in `build/bundle`!

See the section about [building](https://platform.dhis2.nu/#/scripts/build) for more information.

### `yarn deploy`

Deploys the built app in the `build` folder to a running DHIS2 instance.<br />
This command will prompt you to enter a server URL as well as the username and password of a DHIS2 user with the App Management authority.<br/>
You must run `yarn build` before running `yarn deploy`.<br />

See the section about [deploying](https://platform.dhis2.nu/#/scripts/deploy) for more information.

## Simulating the dashboard plugin

With `yarn start` running, open [http://localhost:3000/plugin-host.html](http://localhost:3000/plugin-host.html) and log in to see a page (not in releases) that runs the dashboard plugin in an iframe, the way a dashboard does (with the `Plugin` component from `@dhis2/app-runtime`). Pick a map, then try what a dashboard does with it: filters, resizing, fullscreen. To include it in a PR's Netlify preview (at `/plugin-host.html`), add the `preview plugin` label to the PR.

The plugin e2e tests (`cypress/integration/plugin.cy.js`) use the same page, sending the plugin dashboard-like props through `window.setPluginProps`.

## e2e tests on pull requests

The e2e tests run on every push to a ready-for-review pull request into master, the only branch that requires them to pass. Drafts and pull requests into other branches (such as stacked pull requests) skip them; build, lint and unit tests still run.

A draft into master shows its required e2e check as "Expected" until it is marked ready for review, which starts the e2e tests. A pull request whose base changes to master runs the e2e tests on its next push, such as "Update branch".

Add the `e2e run` label to run the e2e tests once on any pull request. The workflow removes the label when the run starts, so adding it again starts another run. Other labels don't start the e2e tests.

A pull request comment shows the last full e2e run, and whether the e2e tests ran on the latest commit.

## Cypress Cloud and the DHIS2 development version

While a pull request has the `e2e record` label, its e2e runs are recorded in Cypress Cloud. While it has the `e2e dev` label, each e2e run also runs the tests against the DHIS2 development version. A run reads the labels when it starts, so add them before `e2e run`.

Recording is opt-in to save Cypress Cloud credits.

## Learn More

You can learn more about the platform in the [DHIS2 Application Platform Documentation](https://platform.dhis2.nu/).

You can learn more about the runtime in the [DHIS2 Application Runtime Documentation](https://runtime.dhis2.nu/).

To learn React, check out the [React documentation](https://reactjs.org/).
