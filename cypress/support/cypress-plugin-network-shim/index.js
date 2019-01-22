/* global Cypress, cy, afterEach, before, after */

import { getConfig } from './config';
import { getSpecName } from './utils';
import NetworkShim from './NetworkShim';

const checkConfig = config => {
    return config.specName;
};

const enable = options => {
    let shim;
    let success = true;

    const config = getConfig(options);
    console.log('INIT', config.specName, config);
    shim = new NetworkShim(config);

    beforeEach(function() {
        if (shim) {
            console.log('start', this.currentTest);
            shim.startTest(this.currentTest.fullTitle());
        }
    });

    afterEach(function() {
        success = success && this.currentTest.state === 'passed';
    });

    after(function() {
        console.log('AFTER', success, Cypress.spec.absolute);
        if (shim && success) {
            shim.flush();
        }
        shim = null;
    });
};

const theShimNamespace = {
    _enabled: false,
    _defaults: {},
    enable(options) {
        const config = { ...this._defaults, ...options };
        config.specName = config.specName || getSpecName();
        if (checkConfig) {
            this._enabled = true;
            return enable(config);
        }
    },
    defaults(config) {
        this._defaults = { ...config };
        return this._defaults;
    },
    get enabled() {
        return this._enabled;
    },
    get config() {
        return getConfig(this._defaults);
    },
};

Cypress.NetworkShim = theShimNamespace;
