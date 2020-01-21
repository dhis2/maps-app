// <reference types="Cypress" />
/* global Promise, Cypress, cy */

// TODO: Move fixture generation processing to a node.js Cypress plugin using cy.task()
// TODO: Use EXTERNAL_API exclusively, E2E is redundant

export const externalUrl =
    Cypress.env('EXTERNAL_API') || 'http://localhost:8080';
export const e2e = Cypress.env('E2E');
export const generateFixtures = Cypress.env('GEN_FIXTURES');
export const stubBackend = !e2e && !generateFixtures;

let polyfill;
before(() => {
    console.info('Load fetch XHR polyfill')
    cy.readFile('./cypress/support/unfetch.umd.js').then((content) => {
      polyfill = content
    })
})

export const stubFetch = win => {
    // From https://github.com/cypress-io/cypress-example-recipes/blob/master/examples/stubbing-spying__window-fetch/cypress/integration/polyfill-fetch-from-tests-spec.js
    // The application should polyfill window.fetch to use XHR, so we can inspect network requests and easily stub responses using cy.server
    delete win.fetch
    // since the application code does not ship with a polyfill
    // load a polyfilled "fetch" from the test
    win.eval(polyfill)
    win.fetch = win.unfetch
};

const xhrManager = {
    totalSize: 0,
    duplicates: 0,
    nonDeterministicResponses: 0,
    requests: [],
};
const xhrRequestMap = {};

const blobToText = blob =>
    new Promise(resolve => {
        const fr = new FileReader();
        fr.addEventListener('loadend', () => {
            resolve(fr.result);
        });
        fr.readAsText(blob);
    });

const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const stubRequest = (url, response, method = 'GET') => {
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

const genFixturesOnRequest = async xhr => {
    const dedupKey = `${xhr.method} ${xhr.url}`;

    if (!xhrRequestMap[dedupKey]) {
        xhrRequestMap[dedupKey] = {
            path: xhr.url.substr(externalUrl.length),
            method: xhr.method,
            count: 0,
            response: null,
        };
        xhrManager.requests.push(xhrRequestMap[dedupKey]);
    }

    const req = xhrRequestMap[dedupKey];
    req.count += 1;
    if (req.count == 2) {
        xhrManager.duplicates += 1;
    }

    return xhr;
};

const genFixturesOnResponse = async xhr => {
    const dedupKey = `${xhr.method} ${xhr.url}`;

    const body = xhr.response.body;

    const req = xhrRequestMap[dedupKey];
    const res = await blobToText(body);

    if (req.response) {
        if (res !== req.response) {
            xhrManager.nonDeterministicResponses += 1;
            req.nonDeterministic = true;
        }
    } else {
        req.response = res;
        req.size = body.size;
        req.method = xhr.method;

        xhrManager.totalSize += body.size;
    }

    return xhr;
};

Cypress.Commands.add('startServer', collection => {
    if (stubBackend) {
        cy.server({ force404: true });

        // Allow all requests to app server (usually webpack-dev-server) to pass through, all other XHR urls will generate a 404
        httpMethods.forEach(method => {
            cy.route(method, `${Cypress.config('baseUrl')}/**`);
        });

        cy.fixture(collection).then(requestsFixture => {
            requestsFixture.requests.forEach(req => {
                const { path, method = 'GET', response } = req;

                if (response) {
                    stubRequest(`${externalUrl}${path}`, response, method);
                }
            });
        });
    } else if (generateFixtures) {
        cy.server({
            onRequest: genFixturesOnRequest,
            onResponse: genFixturesOnResponse,
        });
        httpMethods.forEach(method => {
            cy.route(method, `${externalUrl}/**`);
        });
    }
});

Cypress.Commands.add('saveFixtures', collection => {
    if (generateFixtures) {
        xhrManager.requests.forEach(req => {
            cy.wrap(req, { log: false })
                .its('response')
                .should('not.be', null);
        });
        cy.writeFile(`cypress/fixtures/${collection}.json`, xhrManager, {
            timeout: 30000,
        });
    }
});
