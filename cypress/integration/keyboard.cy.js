import { EXTENDED_TIMEOUT } from '../support/util.js'

const map = {
    id: 'eDlFx0jTtV9',
    cardTitle: 'ANC LLITN coverage',
}

const alt = {
    group: 'HIV',
    name: 'VCCT post-test counselling rate',
}

describe('keyboard navigation', () => {
    it('tab', () => {
        cy.visit('/', EXTENDED_TIMEOUT)

        // StartEndDate
        cy.getByDataTest('add-layer-button', EXTENDED_TIMEOUT).click()

        cy.get(`[data-test="addlayeritem-thematic"]`).click()
        cy.getByDataTest('layeredit').should('be.visible')

        cy.getByDataTest('dhis2-uicore-tabbar-tabs')
            .find('button')
            .contains('Period')
            .click()
        cy.contains('Define start - end dates').click()
        cy.getByDataTest('calendar-clear-button').eq(0).click()
        cy.getByDataTest('calendar').should('not.exist')
        cy.getByDataTest('start-date-input-content').eq(0).click()
        cy.getByDataTest('calendar').should('be.visible')
        cy.getByDataTest('start-date-input-content')
            .eq(0)
            .find('input')
            .type('123', { force: true })
        cy.press(Cypress.Keyboard.Keys.TAB)
        cy.getByDataTest('calendar').should('not.exist')
        cy.press(Cypress.Keyboard.Keys.TAB)
        cy.getByDataTest('calendar').should('be.visible')
        cy.press(Cypress.Keyboard.Keys.TAB)
        cy.getByDataTest('calendar').should('not.exist')
    })

    // TODO: Re-enable this test once @dhis2/ui is upgraded to 10.7.7
    // See Github PR https://github.com/dhis2/ui/pull/1696
    it.skip('esc', () => {
        cy.visit(`/#/${map.id}`, EXTENDED_TIMEOUT)
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        // Layer popover
        cy.getByDataTest('add-layer-button').click()
        cy.getByDataTest('addlayerpopover').should('be.visible')
        cy.realPress('Escape')
        cy.getByDataTest('addlayerpopover').should('not.exist')

        // Manage layer sources modal
        cy.getByDataTest('add-layer-button').click()
        cy.getByDataTest('managelayersources-button').click()
        cy.getByDataTest('managelayersourcesmodal').should('be.visible')
        cy.realPress('Escape')
        cy.getByDataTest('managelayersourcesmodal').should('not.exist')

        // Download mode
        cy.getByDataTest('dhis2-analytics-hovermenubar')
            .find('button')
            .contains('Download')
            .click()
        cy.getByDataTest('download-settings').should('be.visible')
        cy.realPress('Escape')
        cy.getByDataTest('download-settings').should('not.exist')

        // Layer edit
        cy.getByDataTest('layer-edit-button').click()
        cy.getByDataTest('layeredit').should('be.visible')
        cy.get('[data-test="indicatorgroupselect"]').click()
        cy.contains(alt.group).click()
        cy.get('[data-test="indicatorselect"]').click()
        cy.contains(alt.name).click()
        cy.realPress('Escape')
        cy.getByDataTest('layeredit').should('not.exist')
        cy.getByDataTest('layercard')
            .contains(map.cardTitle, { timeout: 50000 })
            .should('be.visible')

        // StartEndDate
        cy.getByDataTest('layer-edit-button').click()
        cy.getByDataTest('layeredit').should('be.visible')
    })
})
