// <reference types="Cypress" />
/* global cy, Cypress */

import { MODES, HTTP_METHODS } from './constants';
import {
    blobToText,
    stubRequest,
    getMatchingHost,
    makeFixtureName,
    stubFetch,
} from './utils';

class NetworkShim {
    constructor({
        specName = 'default',
        hosts,
        mode = MODES.STUB,
        fetchPolyfill = true,
        fixturePrefix = 'network/',
        fixturePostfix = '.network.shim',
        clock = Date.UTC(2018, 11, 16, 13, 10, 9),
    }) {
        this.hosts = hosts;
        this.mode = mode;
        this.specName = specName;
        this.started = false;
        this.fixtureName = makeFixtureName(specName, {
            fixturePrefix,
            fixturePostfix,
        });

        if (this.mode === MODES.GENERATE) {
            this.store = {
                name: specName,
                hosts: Object.keys(hosts),
                tests: {},
            };
        } else if (this.mode === MODES.STUB) {
            this.loadFixture();
        }

        if (fetchPolyfill !== false) {
            Cypress.on('window:before:load', stubFetch(fetchPolyfill));
        }

        // Ensure we don't get fixture cache misses because of date changes
        if (clock) {
            cy.clock(clock, ['Date']);
        }
    }

    loadFixture() {
        cy.fixture(this.fixtureName).then(fixture => {
            this.store = fixture;
        });
    }
    startTest(name = '__default__') {
        if (this.mode === MODES.STUB) {
            this.current = this.store.tests[name];
            if (this.current) {
                cy.server();

                this.addStubRoutes();
            }
        } else if (this.mode === MODES.GENERATE) {
            this.current = this.store.tests[name] = {
                name,
                totalSize: 0,
                duplicates: 0,
                nonDeterministicResponses: 0,
                requests: [],
            };
            this.requestMap = {};

            cy.server({
                onRequest: this.captureOnRequest,
                onResponse: this.captureOnResponse,
            });

            this.addCaptureRoutes();
        }

        this.started = true;
    }

    addStubRoutes() {
        // TODO: Force 404 if no match found

        // Allow all requests to app server (usually webpack-dev-server) to pass through, all other XHR urls will generate a 404
        HTTP_METHODS.forEach(method => {
            cy.route(method, `${Cypress.config('baseUrl')}/**`);
        });

        this.current.requests.forEach(req => {
            const { path, method = 'GET', response, hostIndex = 0 } = req;

            if (response) {
                stubRequest(
                    `${this.hosts[hostIndex]}${path}`,
                    response,
                    method
                );
            }
        });
    }

    addCaptureRoutes() {
        this.hosts.forEach(host => {
            HTTP_METHODS.forEach(method => {
                cy.route(method, `${host}/**`);
            });
        });
    }

    captureOnRequest = async xhr => {
        const host = getMatchingHost(xhr.url, this.hosts);
        if (host === -1) {
            // pass through
            return xhr;
        }

        // TODO: Differentiate by request body
        const key = `${xhr.method} ${xhr.url}`;

        if (!this.requestMap[key]) {
            const path = xhr.url.substr(this.hosts[host].length);
            this.requestMap[key] = {
                host,
                path,
                method: xhr.method,
                count: 0,
                response: null,
            };
            this.current.requests.push(this.requestMap[key]);
        }

        const req = this.requestMap[key];
        req.count += 1;
        if (req.count == 2) {
            this.current.duplicates += 1;
        }

        return xhr;
    };

    captureOnResponse = async xhr => {
        const host = getMatchingHost(xhr.url, this.hosts);
        if (!host) {
            // pass through
            return xhr;
        }

        const key = `${xhr.method} ${xhr.url}`;

        const body = xhr.response.body;

        const req = this.requestMap[key];
        const res = await blobToText(body);

        if (req.response) {
            if (res !== req.response) {
                this.current.nonDeterministicResponses += 1;
                req.nonDeterministic = true;
            }
        } else {
            // TODO: Capture response headers
            req.response = res;
            req.size = body.size;
            req.method = xhr.method;

            this.current.totalSize += body.size;
        }

        return xhr;
    };

    flush() {
        if (!this.started || this.mode !== MODES.GENERATE) {
            return;
        }

        const fixtureFile = `cypress/fixtures/${this.fixtureName}.json`;
        cy.log(
            `Writing network fixture for ${this.specName} to ${fixtureFile}`
        );

        this.current.requests.forEach(req => {
            cy.wrap(req, { log: false })
                .its('response')
                .should('not.be', null);
        });

        cy.writeFile(fixtureFile, this.store, {
            timeout: 30000,
        });

        this.started = false;
    }
}

export default NetworkShim;
