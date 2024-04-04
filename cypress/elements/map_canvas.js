import { EXTENDED_TIMEOUT } from '../support/util.js';

export const getMaps = () => cy.get('.dhis2-map canvas', EXTENDED_TIMEOUT);
