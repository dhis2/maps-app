import { stubFetch } from '../../support/network-fixtures';

context('Plugin.html Smoke Test', () => {
    before(() => {
        // cy.server();
    });
    beforeEach(() => {
        cy.startServer('plugin-smoke');
        cy.login('system', 'System123');
        cy.clock(Date.UTC(2018, 11, 16, 13, 10, 9), ['Date']); // Ensure we don't get fixture cache misses because of date changes
        cy.visit('/plugin.html', { onBeforeLoad: stubFetch });
    });
    after(() => {
        cy.saveFixtures('plugin-smoke');
    });

    it('Should load a map with no userOrgUnit filter', () => {
        cy.get('#inputMapID')
            .clear()
            .type('kwX3awhakCk');
        cy.get('#inputUserOrgUnit').clear();

        // cy.route(/\/api\/31\/analytics.json/g).as('dataRequest'); // Breaks network fixtures, since it overwrites the existing route

        cy.get('#map').should('not.be.visible');
        cy.get('#btnLoadPlugin').click();
        // cy.wait('@dataRequest', { timeout: 10000 })
        //     .its('status')
        //     .should('equal', 200);
        cy.get('#map').should('be.visible');

        // TODO: Test that the contents actually display.  This is tough since we're not using Redux
    });

    // TODO: Test that userOrgUnit filter works
});
