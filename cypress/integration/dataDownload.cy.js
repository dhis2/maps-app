import { EXTENDED_TIMEOUT } from '../support/util.js'

const mapWithThematicLayer = {
    id: 'ZBjCfSaLSqD',
    name: 'ANC: LLITN coverage district and facility',
    downloadName: 'ANC_LLITN_coverage.geojson',
}

const mapWithEventLayer = {
    id: 'kNYqHu3e7o3',
    name: 'Malaria: Cases 2015-2016 Western Area events',
    downloadName: 'Malaria_case_registration.geojson',
}

describe('Data Download', () => {
    it('downloads data from a thematic layer', () => {
        cy.visit(`/?id=${mapWithThematicLayer.id}`, EXTENDED_TIMEOUT)
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        cy.get('[data-test="moremenubutton"]').first().click()

        cy.get('[data-test="more-menu"]')
            .find('li')
            .not('.disabled')
            .should('have.length', 6)

        cy.get('[data-test="more-menu"]')
            .find('li')
            .contains('Download data')
            .click()

        //check that the download modal is present
        cy.get('[data-test="data-download-modal"]')
            .find('h1')
            .contains('Download Layer Data')

        cy.get('[data-test="data-download-modal"]')
            .find('button')
            .contains('Download')
            .click()

        const downloadsFolder = Cypress.config('downloadsFolder')
        const downloadedFilename = `${downloadsFolder}/${mapWithThematicLayer.downloadName}`

        cy.readFile(downloadedFilename, 'binary', { timeout: 15000 }).should(
            (buffer) => expect(buffer.length).to.be.gt(1000)
        )
    })

    it('downloads data from an event layer', () => {
        cy.visit(`/?id=${mapWithEventLayer.id}`, EXTENDED_TIMEOUT)
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        cy.get('[data-test="moremenubutton"]').first().click()

        cy.get('[data-test="more-menu"]')
            .find('li')
            .not('.disabled')
            .should('have.length', 5)

        cy.get('[data-test="more-menu"]')
            .find('li')
            .contains('Download data')
            .click()

        //check that the download modal is present
        cy.get('[data-test="data-download-modal"]')
            .find('h1')
            .contains('Download Layer Data')

        cy.get('[data-test="data-download-modal"]')
            .find('button')
            .contains('Download')
            .click()

        const downloadsFolder = Cypress.config('downloadsFolder')
        const downloadedFilename = `${downloadsFolder}/${mapWithEventLayer.downloadName}`

        cy.readFile(downloadedFilename, 'binary', { timeout: 15000 }).should(
            (buffer) => expect(buffer.length).to.be.gt(1000)
        )
    })
})
