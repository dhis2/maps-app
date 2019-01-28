/* global Cypress */

import initNetworkShim from 'cypress-plugin-network-shim';
initNetworkShim({
    hosts: {
        core: 'http://localhost:8080',
    },
});

import './commands';
import './redux';
