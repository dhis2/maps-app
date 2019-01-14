// <reference types="Cypress" />
/* global Promise, Cypress, cy */

import { getNetworkShimConfig } from './cypress-plugin-network-shim';
import { MODES } from './cypress-plugin-network-shim/constants';

Cypress.Commands.add('login', (username, password) => {
    const config = getNetworkShimConfig();
    if (config.mode !== MODES.STUB) {
        cy.request({
            method: 'POST',
            url: `${config.hosts.core}/dhis-web-commons-security/login.action`,
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
    const config = getNetworkShimConfig();
    cy.visit(path);
    cy.get('header', { log: false, timeout: 10000 }); // Waits for the page to fully load
    if (config.mode === MODES.GENERATE) {
        //Make sure all the delayed network requests get captured
        cy.wait(1000);
    }
});
