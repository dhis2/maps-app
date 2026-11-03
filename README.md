# PR screenshots

Images shown in pull request descriptions of this repository, one folder per Jira ticket (for example `DHIS2-21456/`).

This branch shares no history with the app and is never merged: nothing here is built, tested or released.

## Retaking the screenshots

A folder can hold the Cypress spec that took its images (`screenshots.cy.js`). It opens a pull request's Netlify preview, draws a red rectangle around the area to look at, and saves a cropped screenshot. To run it:

1. Copy the spec into `cypress/integration/` of a maps-app checkout.
2. Run it against one preview, signed in to the DHIS2 instance the preview uses:

    ```sh
    yarn cypress run --spec cypress/integration/screenshots.cy.js \
        --config baseUrl=https://pr-<number>.maps.netlify.dhis2.org \
        --env "preview=<number>,dhis2BaseUrl=<instance URL>,dhis2Username=<user>,dhis2Password=<password>,dhis2InstanceVersion=<version>"
    ```

3. The images are in `cypress/screenshots/screenshots.cy.js/`. Copy them into the ticket's folder here.

Each preview gives the "after" images of its own pull request and the "before" images of the next one in the stack.
