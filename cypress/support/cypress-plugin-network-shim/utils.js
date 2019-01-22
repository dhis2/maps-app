import { MODES } from './constants';

/* global Promise, cy, Cypress */

export const parseMode = (mode = '') => {
    switch (mode.toUpperCase()) {
        case MODES.SKIP:
        case MODES.STUB:
        case MODES.GENERATE:
            return mode.toUpperCase();
        default:
            return null;
    }
};

export const splitHostsString = hostsString => {
    return hostsString.split(',');
};

export const blobToText = blob =>
    new Promise(resolve => {
        const fr = new FileReader();
        fr.addEventListener('loadend', () => {
            resolve(fr.result);
        });
        fr.readAsText(blob);
    });

export const stubRequest = (url, response, method = 'GET') => {
    // This stubbing method is required to circumvent a Node.js 80kb header limit, so just always use it.
    // From https://github.com/cypress-io/cypress/issues/76
    return cy.route({
        url,
        method,
        response: '',
        onRequest: xhr => {
            const originalOnLoad = xhr.xhr.onload;
            xhr.xhr.onload = function() {
                Object.defineProperty(this, 'response', {
                    writable: true,
                });
                this.response = response;
                originalOnLoad.apply(this, xhr);
            };
        },
    });
};

export const getMatchingHost = (url, hosts) => {
    const hostNames = Object.keys(hosts);
    for (let i = 0; i < hostNames.length; ++i) {
        if (url.indexOf(hosts[hostNames[i]]) === 0) {
            return hostNames[i];
        }
    }
    return null;
};

export const getSpecName = () => {
    const spec = Cypress.spec;
    if (spec.relative === '__all') {
        return null;
    }

    const specName = spec.relative
        .replace(/cypress\/integration\//, '')
        .replace(/(.spec)?(.ts|.js)$/g, '');
    return specName;
};

export const makeFixtureName = (
    specName,
    { fixturePrefix, fixturePostfix }
) => {
    return `${fixturePrefix}${specName}${fixturePostfix}.json`;
};

export const stubFetch = polyfill => win => {
    // From https://github.com/cypress-io/cypress-example-recipes/blob/master/examples/stubbing-spying__window-fetch/cypress/integration/polyfill-fetch-from-tests-spec.js
    // The application should polyfill window.fetch to use XHR, so we can inspect network requests and easily stub responses using cy.server
    delete win.fetch;
    if (typeof polyfill === 'function') {
        win.fetch = polyfill;
    }
};

export const getEnvHosts = (hosts, { prefix = 'NETWORK_SHIM_HOST' } = {}) => {
    let hostMap = {};
    if (Array.isArray(hosts)) {
        hosts.forEach(host => {
            hostMap[host.toLowerCase()] = null;
        });
    } else if (typeof hosts === 'object') {
        Object.keys(hosts).forEach(name => {
            hostMap[name.toLowerCase()] = hosts[name];
        });
    } else {
        return;
    }

    Object.keys(hostMap).forEach(name => {
        const upperName = name.toUpperCase();
        const envVal = Cypress.env(`${prefix}_${upperName}`);
        if (envVal) {
            hostMap[name] = envVal;
        } else if (!hostMap[name]) {
            throw new Error(
                `No host specified for key ${name} - set the environment variable CYPRESS_${prefix}_${upperName}`
            );
        }
    });

    return hostMap;
};
