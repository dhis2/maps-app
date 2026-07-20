import { getMaps } from '../elements/map_canvas.js'
import { CURRENT_YEAR, EXTENDED_TIMEOUT } from '../support/util.js'

describe('OrgUnitInfo', () => {
    it('opens the panel for an OrgUnit', () => {
        cy.visit('/#/eDlFx0jTtV9')
        cy.get('canvas').should('be.visible')

        cy.waitForMap()
        getMaps().click(350, 350) //Click somewhere on the map

        cy.intercept('GET', '**/organisationUnitProfile/eDlFx0jTtV9/data**').as(
            'orgUnitProfile'
        )

        cy.get('.maplibregl-popup', EXTENDED_TIMEOUT)
            .contains('View profile')
            .click()

        cy.wait('@orgUnitProfile', EXTENDED_TIMEOUT)

        // check the Org Unit Profile panel
        cy.getByDataTest('org-unit-profile').contains(
            'Organisation unit profile'
        )

        // // TODO - find a way to ensure that "Bombali" is the orgunit that was clicked on
        // // cy.getByDataTest('org-unit-info').find('h3').contains('Bombali')

        cy.intercept('GET', '**/organisationUnitProfile/eDlFx0jTtV9/data**').as(
            'orgUnitProfilePreviousYear'
        )

        cy.getByDataTest('org-unit-data')
            .findByDataTest('button-previous-year')
            .click()

        cy.wait('@orgUnitProfilePreviousYear', EXTENDED_TIMEOUT)

        cy.getByDataTest('org-unit-data')
            .findByDataTest('dhis2-uicore-circularloader')
            .should('not.exist')

        cy.getByDataTest('year-select').contains(CURRENT_YEAR - 1)

        cy.getByDataTest('org-unit-data-table').contains('Expected pregnancies')
    })
})
