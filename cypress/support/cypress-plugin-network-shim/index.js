/* global Cypress, beforeEach, after */

import { getConfig } from './config';
import { getSpecName } from './utils';
import NetworkShim from './NetworkShim';

let theShim = null;
let theConfigDefaults = null;
let theConfig = null;

export const getNetworkShimConfig = () => {
    return theConfig;
};
Cypress.Commands.add('getNetworkShimConfig', getNetworkShimConfig);

export const getNetworkShim = () => {
    return theShim;
};
Cypress.Commands.add('getNetworkShim', getNetworkShim);

export const initialize = (defaults = {}) => {
    const specName = getSpecName();
    theConfigDefaults = defaults;
    theConfig = getConfig(defaults);

    beforeEach(function() {
        if (!theShim) {
            theShim = new NetworkShim({ specName, ...theConfig });
        }
        theShim.startTest(this.currentTest.fullTitle());
    });

    after(function() {
        console.log('FLUSH', this.currentTest.state);
        if (this.currentTest.state === 'passed') {
            theShim.flush();
        }
    });
};

Cypress.Commands.add('configureNetworkShim', opts => {
    if (theShim) {
        throw new Error(
            'The Network Shim is already running, be sure to configure it in a before() hook!'
        );
    }
    theConfig = getConfig({
        ...theConfigDefaults,
        opts,
    });
});
