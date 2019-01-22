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
        specName,
        hosts,
        mode = MODES.STUB,
        fetchPolyfill = true,
        fixturePrefix = 'network/',
        fixturePostfix = '.network',
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
        this.fixtureFile = `cypress/fixtures/${this.fixtureName}`;

        if (this.mode === MODES.STUB) {
            cy.log(`Loading network shim fixture at ${this.fixtureName}`);
            this.loadFixture();
        } else if (this.mode === MODES.GENERATE) {
            this.store = {
                name: this.specName,
                hosts: Object.keys(this.hosts),
                tests: {},
            };
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
            console.log('LOAD', fixture);
            this.store = fixture;
        });
        console.log(this.store);
    }
    startTest(name) {
        if (this.mode === MODES.STUB) {
            this.current = this.store.tests[name];

            cy.server();
            this.addStubRoutes();
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
        Object.values(this.hosts).forEach(host => {
            HTTP_METHODS.forEach(method => {
                cy.route({
                    method,
                    url: `${host}/**`,
                    status: 404,
                    response: 'Cypress::NetworkShim Missing fixture',
                    onResponse: xhr => {
                        console.error(
                            `Cypress::NetworkShim ERROR: No request fixture found for ${
                                xhr.method
                            } ${xhr.url}`
                        );
                    },
                });
            });
        });

        // // Allow all requests to app server (usually webpack-dev-server) to pass through, all other XHR urls will generate a 404
        // HTTP_METHODS.forEach(method => {
        //     cy.route(method, `${Cypress.config('baseUrl')}/**`);
        // });

        if (this.current && this.current.requests) {
            this.current.requests.forEach(req => {
                const { path, method = 'GET', response, host } = req;

                if (!host) {
                    console.error(
                        `Host ${host} not recognized in fixture, skipping`
                    );
                }

                if (response) {
                    stubRequest(`${this.hosts[host]}${path}`, response, method);
                }
            });
        }
    }

    addCaptureRoutes() {
        Object.values(this.hosts).forEach(host => {
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
        console.log('FLUSH1', this.started, this.mode, MODES.GENERATE);
        if (!this.started || this.mode !== MODES.GENERATE) {
            return;
        }
        console.log('flush2');

        cy.log(
            `Writing network fixture for ${this.specName} to ${
                this.fixtureFile
            }`
        );

        this.current.requests.forEach(req => {
            cy.wrap(req, { log: false })
                .its('response')
                .should('not.be', null);
        });

        cy.writeFile(this.fixtureFile, this.store, {
            timeout: 30000,
        });

        this.started = false;
    }
}

export default NetworkShim;
