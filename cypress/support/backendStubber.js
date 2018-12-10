// /// <reference types="Cypress" />

// const blobToText = blob => {
//     return new Promise((resolve, reject) => {
//         const fr = new FileReader();
//         fr.addEventListener('loadend', () => {
//             resolve(fr.result);
//         });
//         fr.readAsText(blob);
//     });
// };

// export default () => {
//     const apiUrl = Cypress.env('EXTERNAL_API') || 'http://localhost:8080';
//     const e2e = Cypress.env('E2E');
//     const generateFixtures = Cypress.env('GEN_FIXTURES');
//     const stubBackend = !e2e && !generateFixtures;

//     let requests = {};

//     const fixtureFile = Cypress.spec.relative.substr(
//         Cypress.config('integrationFolder').length
//     );

//     before(() => {
//         if (stubBackend) {
//             cy.log(
//                 'Stubbing all backend network requests - unmatched requests will automatically fail'
//             );
//         } else {
//             cy.log(
//                 `Performing end-to-end test with API server URL '${apiUrl}'`
//             );
//             if (generateFixtures) {
//                 cy.log('Generating fixtures from end-to-end network requests');
//             }
//         }

//         cy.server({
//             delay: 100,
//             // force404: stubBackend ? true : undefined,
//             onResponse: async xhr => {
//                 if (generateFixtures) {
//                     requests[xhr.url] = await blobToText(xhr.response.body);
//                 }
//                 return xhr;
//             },
//         });
//         if (!stubBackend) {
//             cy.route(`${apiUrl}/api/**`);
//             return;
//         }
//         cy.fixture(fixtureFile).then(requestsFixture => {
//             console.log(requestsFixture);
//             Object.keys(requestsFixture).forEach(url => {
//                 const path = url.substr(apiUrl.length);
//                 cy.route(path, requestsFixture[url]);
//             });
//         });
//     });

//     after(() => {
//         if (generateFixtures) {
//             cy.writeFile(`cypress/fixtures/${fixtureFile}.json`, requests, {
//                 timeout: 30000,
//             });
//             // Object.keys(requests).forEach(async (url, i) => {
//             //     cy.writeFile(`cypress/fixtures/${collection}/${i}`, requests[url]);
//             // });
//             requests = {};
//         }
//     });
// };
