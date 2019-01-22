/* global Cypress */

import './cypress-plugin-network-shim';
Cypress.NetworkShim.defaults({
    hosts: {
        core: 'http://localhost:8080',
    },
});

import './commands';
import './redux';
