// <reference types="Cypress" />
/* global Promise, Cypress, cy */

import 'cypress-pipe';

Cypress.Commands.add('getReduxState', selector =>
    cy.window().pipe(win => selector(win.store.getState()))
);
