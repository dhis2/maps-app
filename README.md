# maps-app

DHIS2 Maps App

Travis CI: https://travis-ci.com/dhis2/maps-app

## Running Tests

We run two types of tests on this project, **unit** and **integration/browser**. Both are run automatically by Travis.

```sh
# Linting and unit tests
> yarn lint # Evaluate code linting rules
> yarn test # Run JEST for unit testing

# Before running browser tests, start a development server at http://localhost:8082 or another addess exported as CYPRESS_ROOT_URL
> yarn start
> export CYPRESS_ROOT_URL=http://localhost:8082
> export CYPRESS_EXTERNAL_API=http://localhost:8080 # Tell Cypress where the DHIS2 core server lives.  Must match application's DHIS2 config, running server only required for E2E tests

# Browser tests
> yarn cy:stub:open # Run interactive GUI Cypress browser tests (against a stubbed backend network)
> yarn cy:stub:run # Run headless Cypress browser tests (against a stubbed backend network)
> yarn cy:e2e:open # Run interactive GUI Cypress browser tests against a real backend
> yarn cy:e2e:run # Run headless Cypress browser tests against a real backend
> yarn cy:e2e:update # Run headless Cypress browser tests against a real backend an generate new netowrk stubbing fixtures
```

Cypress tests live at [cypress/integration/\*\*.spec.js](./cypress/integration/). Network fixtures are in the [cypress/fixtures](./cypress/fixtures/) directory and **should** be committed to source control.
