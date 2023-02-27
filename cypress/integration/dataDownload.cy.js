import { EXTENDED_TIMEOUT } from '../support/util.js'

const mapWithThematicLayer = {
    id: 'eDlFx0jTtV9',
    name: 'ANC: LLITN Cov Chiefdom this year',
    downloadName: 'ANC_LLITN_coverage.geojson',
    cardTitle: 'ANC LLITN coverage',
}

const mapWithEventLayer = {
    id: 'kNYqHu3e7o3',
    name: 'Malaria: Cases 2015-2016 Western Area events',
    downloadName: 'Malaria_case_registration.geojson',
    cardTitle: 'Malaria case registration',
}

const openMoreMenuWithOptions = (numOptions) => {
    cy.get('[data-test="moremenubutton"]').first().click()

    cy.get('[data-test="more-menu"]')
        .find('li')
        .not('.disabled')
        .should('have.length', numOptions)

    cy.get('[data-test="more-menu"]')
        .find('li')
        .contains('Download data')
        .click()

    //check that the download modal is present
    cy.get('[data-test="data-download-modal"]')
        .find('h1')
        .contains('Download Layer Data')
}

describe('Data Download', () => {
    it('downloads data from a thematic layer', () => {
        cy.visit(`/?id=${mapWithThematicLayer.id}`, EXTENDED_TIMEOUT)
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        cy.get('[data-test="layercard"]')
            .find('h2')
            .contains(mapWithThematicLayer.cardTitle, EXTENDED_TIMEOUT)

        openMoreMenuWithOptions(6)

        cy.get('[data-test="data-download-modal"]')
            .find('button')
            .contains('Download')
            .click()

        const downloadsFolder = Cypress.config('downloadsFolder')
        const downloadedFilename = `${downloadsFolder}/${mapWithThematicLayer.downloadName}`

        cy.readFile(downloadedFilename, EXTENDED_TIMEOUT).should((buffer) =>
            expect(buffer.length).to.be.gt(1000)
        )
    })

    it('downloads data from an event layer', () => {
        cy.visit(`/?id=${mapWithEventLayer.id}`, EXTENDED_TIMEOUT)
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        cy.get('[data-test="layercard"]')
            .find('h2')
            .contains(mapWithEventLayer.cardTitle, EXTENDED_TIMEOUT)

        openMoreMenuWithOptions(5)

        cy.get('[data-test="data-download-modal"]')
            .find('button')
            .contains('Download')
            .click()

        const downloadsFolder = Cypress.config('downloadsFolder')
        const downloadedFilename = `${downloadsFolder}/${mapWithEventLayer.downloadName}`

        cy.readFile(downloadedFilename, EXTENDED_TIMEOUT).should((buffer) =>
            expect(buffer.length).to.be.gt(1000)
        )
    })

    it('fails to download event layer', () => {
        cy.visit(`/?id=${mapWithEventLayer.id}`, EXTENDED_TIMEOUT)
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')
        cy.get('[data-test="layercard"]')
            .find('h2')
            .contains(mapWithEventLayer.cardTitle, EXTENDED_TIMEOUT)

        openMoreMenuWithOptions(5)

        cy.intercept('GET', '**/programStages/**', {
            statusCode: 400,
        }).as('getProgramStages')

        cy.get('[data-test="data-download-modal"]')
            .find('button')
            .contains('Download')
            .click()

        cy.wait('@getProgramStages')
            .its('response.statusCode')
            .should('eq', 400)

        cy.get('[data-test="data-download-modal"]')
            .find('button')
            .not('.disabled')
            .contains('Download')
            .should('have.length', 1)

        cy.contains('Data download failed').should('be.visible')
    })
})
