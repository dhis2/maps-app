/// <reference types="Cypress" />

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

const apiUrl = Cypress.env('EXTERNAL_API') || 'http://localhost:8080';
const e2e = Cypress.env('E2E');
const generateFixtures = Cypress.env('GEN_FIXTURES');
const stubBackend = !e2e && !generateFixtures;

const onBeforeLoad = win => {
    // From https://github.com/cypress-io/cypress-example-recipes/blob/master/examples/stubbing-spying__window-fetch/cypress/integration/polyfill-fetch-from-tests-spec.js
    delete win.fetch; // The application should polyfill window.fetch to use XHR, so we can easily stub responses using cy.server (if we want)
};

// const networkMap = cy.readFile('network-request-map.txt');
let xhrManager = {
    size: 0,
    duplicates: 0,
    nonDeterministicResponses: 0,
    requests: {},
};

const blobToText = blob =>
    new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.addEventListener('loadend', () => {
            resolve(fr.result);
        });
        fr.readAsText(blob);
    });

Cypress.Commands.add('startServer', collection => {
    cy.server({
        force404: stubBackend ? true : undefined,
        onRequest: async xhr => {
            if (!xhrManager.requests[xhr.url]) {
                xhrManager.requests[xhr.url] = { count: 0, response: null };
            }
            const req = xhrManager.requests[xhr.url];
            req.count += 1;
            if (req.count == 2) {
                xhrManager.duplicates += 1;
            }
        },
        onResponse: async xhr => {
            if (generateFixtures) {
                const url = xhr.url;
                const body = xhr.response.body;
                const size = body.size;

                const req = xhrManager.requests[url];

                xhrManager.size += size;
                const res = await blobToText(body);

                if (req.response) {
                    if (res !== req.response) {
                        xhrManager.nonDeterministicResponses += 1;
                    }
                } else {
                    req.response = res;
                    req.size = size;
                }
            }
            return xhr;
        },
    });

    if (!stubBackend) {
        cy.route(`${apiUrl}/**`);
        return;
    }

    cy.route(`${Cypress.config('baseUrl')}/**`);

    cy.fixture(collection).then(requestsFixture => {
        Object.keys(requestsFixture.requests).forEach(url => {
            if (requestsFixture.requests[url].response) {
                // Ignore null entries
                cy.route(url, requestsFixture.requests[url].response);
            }
        });
    });
});

Cypress.Commands.add('saveFixtures', collection => {
    if (generateFixtures) {
        Object.keys(xhrManager.requests).forEach(url => {
            cy.wrap(xhrManager.requests[url], { log: false })
                .its('response')
                .should('not.be', null);
        });
        const xhrCache = Object.keys(xhrManager.requests).reduce(
            (out, url) => ({
                ...out,
                [url]: xhrManager.requests[url].response,
            }),
            {}
        );
        cy.log(xhrCache);
        cy.writeFile(`cypress/fixtures/${collection}.json`, xhrManager, {
            timeout: 30000,
        });
        // Object.keys(requests).forEach(async (url, i) => {
        //     cy.writeFile(`cypress/fixtures/${collection}/${i}`, requests[url]);
        // });
        // xhrManager.requests = {};
    }
});
Cypress.Commands.add('login', (username, password) => {
    if (stubBackend) {
        cy.log(
            'Stubbing all backend network requests - unmatched requests will automatically fail'
        );
    } else {
        cy.log(`Performing end-to-end test with API server URL '${apiUrl}'`);
        if (generateFixtures) {
            cy.log('Generating fixtures from end-to-end network requests');
        }
    }
    if (!stubBackend) {
        cy.request({
            method: 'POST',
            url: `${apiUrl}/dhis-web-commons-security/login.action`,
            body: {
                j_username: username,
                j_password: password,
            },
            form: true,
            log: true,
        });
    }
});

Cypress.Commands.add('persistLogin', () => {
    Cypress.Cookies.preserveOnce('JSESSIONID');
});

Cypress.Commands.add('loadPage', (path = '/') => {
    cy.visit(path, { onBeforeLoad });
    cy.get('header', { log: false, timeout: 10000 }); // Waits for the page to fully load
    if (generateFixtures) {
        //Make sure all the delayed network requests get captured
        cy.wait(5000);
    }
});
