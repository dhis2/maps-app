# maps-app

DHIS2 Maps App

## Running Tests

There are two types of tests on this project, **unit** and **integration/browser**. Both are run automatically on CI on PRs using Github actions.

### Linting and unit tests

```sh
> yarn lint # Evaluate code linting rules
> yarn test # Run JEST for unit testing
```

### Browser tests (Cypress)

To run the Cypress tests locally, first set up the `cypress.env.json` file at the root of the repository. `dhis2_base_url` should be set to the DHIS2 api instance.

```
{
    "dhis2_username": "admin",
    "dhis2_password": "district",
    "dhis2_base_url": "http://localhost:8080"
}
```

Use the following commands to run the tests:

```
> yarn cy:open # runs tests in interactive mode
> yarn cy:run # runs tests in headless browser mode
```

Cypress tests are located at [cypress/integration/\*\*.cy.js](./cypress/integration/).
