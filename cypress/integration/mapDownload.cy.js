import { EXTENDED_TIMEOUT } from '../support/util.js'

const map = {
    id: 'eDlFx0jTtV9',
    name: 'ANC: LLITN Cov Chiefdom this year',
    downloadFileNamePrefix: 'ANC LLITN Cov Chiefdom this year',
    cardTitle: 'ANC LLITN coverage',
}

const openDowloadPage = () => {
    cy.visit(`/?id=${map.id}`, EXTENDED_TIMEOUT)
    cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

    cy.get('header').should('be.visible')
    cy.getByDataTest('layers-panel').should('be.visible')

    cy.get('[data-test="layercard"]')
        .find('h2')
        .contains(map.cardTitle, EXTENDED_TIMEOUT)

    cy.getByDataTest('app-menu').find('button').contains('Download').click()

    cy.get('header').should('not.be.visible')
    cy.getByDataTest('layers-panel').should('not.exist')
}

describe('Map Download', () => {
    beforeEach(() => {
        cy.task('emptyDownloadsFolder')
    })

    it('download options are shown correctly', () => {
        openDowloadPage()

        // verify the state of the checkboxes
        cy.get('label').contains('Show map name').should('be.visible')
        cy.get('label')
            .contains('Show map name')
            .find('input')
            .should('be.checked')
        cy.get('label.disabled')
            .contains('Show map description')
            .should('be.visible')
        cy.get('label')
            .contains('Show map description')
            .find('input')
            .should('be.disabled')
            .should('not.be.checked')
        cy.getByDataTest('download-setting-show-description')
            .findByDataTest('checkbox-tooltip-reference')
            .should('be.visible')
        cy.get('label').contains('Show legend').should('be.visible')
        cy.get('label')
            .contains('Show legend')
            .find('input')
            .should('be.checked')
        cy.get('label').contains('Show overview map').should('be.visible')
        cy.get('label')
            .contains('Show overview map')
            .find('input')
            .should('be.checked')
        cy.get('label').contains('Show north arrow').should('be.visible')
        cy.get('label')
            .contains('Show north arrow')
            .find('input')
            .should('be.checked')

        // verify all the settings are in useEffect
        cy.getByDataTest('download-map-info').should('be.visible')
        cy.getByDataTest('download-map-info').find('h1').contains(map.name)
        cy.getByDataTest('download-map-info')
            .findByDataTest('map-legend')
            .should('be.visible')

        cy.getByDataTest('download-map-info')
            .findByDataTest('overview-map')
            .should('be.visible')

        cy.getByDataTest('north-arrow').should('be.visible')

        // change options and confirm

        cy.get('label').contains('Show north arrow').find('input').uncheck()
        cy.getByDataTest('north-arrow').should('not.exist')

        cy.get('label').contains('Show map name').find('input').uncheck()
        cy.getByDataTest('download-map-info')
            .contains(map.name)
            .should('not.exist')

        cy.get('label').contains('Show overview map').find('input').uncheck()
        cy.getByDataTest('download-map-info')
            .findByDataTest('overview-map')
            .should('not.exist')

        cy.get('label').contains('Show legend').find('input').uncheck()
        cy.getByDataTest('download-map-info').should('not.exist')

        cy.contains('Exit download mode').click()

        cy.get('header').should('be.visible')
        cy.getByDataTest('layers-panel').should('be.visible')

        cy.get('[data-test="layercard"]')
            .find('h2')
            .contains(map.cardTitle, EXTENDED_TIMEOUT)
    })

    it('downloads a map', () => {
        openDowloadPage()

        cy.getByDataTest('download-settings')
            .find('button')
            .contains('Download')
            .click()

        cy.wait(3000) // eslint-disable-line cypress/no-unnecessary-waiting

        cy.waitUntil(
            () => cy.task('getLastDownloadFilePath').then((result) => result),
            { timeout: 3000, interval: 100 }
        ).then((filePath) => {
            expect(filePath).to.include('png')
            expect(filePath).to.include(map.downloadFileNamePrefix)

            cy.readFile(filePath, EXTENDED_TIMEOUT).should((buffer) =>
                expect(buffer.length).to.be.gt(10000)
            )
        })
    })
})
