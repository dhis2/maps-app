// <reference types="Cypress" />
/* global Promise, Cypress, cy */

import './redux';

import {
    stubFetch,
    externalUrl,
    generateFixtures,
    stubBackend,
} from './network-fixtures';

Cypress.Commands.add('login', (username, password) => {
    if (stubBackend) {
        cy.log(
            'Stubbing all backend network requests - unmatched requests will automatically fail'
        );
    } else {
        cy.log(
            `Performing end-to-end test with API server URL '${externalUrl}'`
        );
        if (generateFixtures) {
            cy.log('Generating fixtures from end-to-end network requests');
        }
    }
    if (!stubBackend) {
        cy.request({
            method: 'POST',
            url: `${externalUrl}/dhis-web-commons-security/login.action`,
            body: {
                j_username: username,
                j_password: password,
            },
            form: true,
            log: true,
        });
    }
});

Cypress.Commands.add('persistLogin', () => {
    Cypress.Cookies.preserveOnce('JSESSIONID');
});

Cypress.Commands.add('loadPage', (path = '/') => {
    cy.visit(path, { onBeforeLoad: stubFetch });
    cy.get('[data-test="maps-app-root"]', { log: false, timeout: 10000 }); // Waits for the page to fully load
    if (generateFixtures) {
        //Make sure all the delayed network requests get captured
        cy.wait(1000);
    }
});
