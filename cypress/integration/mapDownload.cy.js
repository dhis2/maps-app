import { EXTENDED_TIMEOUT } from '../support/util.js'

const mapWithThematicLayer = {
    id: 'eDlFx0jTtV9',
    name: 'ANC: LLITN Cov Chiefdom this year',
    downloadFileName: 'ANC LLITN Cov Chiefdom this year.png',
    cardTitle: 'ANC LLITN coverage',
}

const assertDownloadSettingChecked = (label, isChecked) => {
    cy.getByDataTest('download-settings')
        .find('label')
        .contains(label)
        .find('input')
        .should(`${isChecked ? '' : 'not.'}be.checked`)
}

const clickDownloadSetting = (label) => {
    cy.getByDataTest('download-settings')
        .find('label')
        .contains(label)
        .find('input')
        .click()
}

describe('Map Download', () => {
    beforeEach(() => {
        cy.task('emptyDownloadsFolder')
    })

    it('downloads a map', () => {
        cy.visit(`/#/${mapWithThematicLayer.id}`, EXTENDED_TIMEOUT)
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        cy.get('[data-test="layercard"]')
            .find('h2')
            .contains(mapWithThematicLayer.cardTitle, EXTENDED_TIMEOUT)

        cy.getByDataTest('dhis2-analytics-hovermenubar')
            .find('button')
            .contains('Download')
            .click()

        cy.log('confirm that download page is open')
        cy.getByDataTest('headerbar-title').should('not.be.visible')
        cy.getByDataTest('download-settings').should('be.visible')
        cy.get('canvas.maplibregl-canvas').should('be.visible')
        cy.get('button').contains('Exit download mode').should('be.visible')
        cy.url().should('contain', `/#/${mapWithThematicLayer.id}/download`)

        // check the current settings
        assertDownloadSettingChecked('Show map name', true)

        cy.getByDataTest('download-map-info')
            .find('h1')
            .contains(mapWithThematicLayer.name)
            .should('be.visible')

        assertDownloadSettingChecked('Show map description', false)
        assertDownloadSettingChecked('Show legend', true)
        cy.getByDataTest('download-map-info')
            .findByDataTest('download-legend-title')
            .should('have.length', 1)

        assertDownloadSettingChecked('Show overview map', true)
        cy.getByDataTest('download-map-info')
            .findByDataTest('overview-map')
            .should('be.visible')

        // make some changes
        clickDownloadSetting('Show map name')
        cy.getByDataTest('download-map-info').find('h1').should('not.exist')

        clickDownloadSetting('Show north arrow')
        cy.getByDataTest('north-arrow').should('not.exist')

        clickDownloadSetting('Show overview map')
        cy.getByDataTest('download-map-info')
            .findByDataTest('overview-map')
            .should('not.exist')

        clickDownloadSetting('Show legend')
        cy.getByDataTest('download-map-info').should('not.exist')

        // and download the map
        cy.getByDataTest('download-settings')
            .find('button')
            .contains('Download')
            .click()

        // check for downloaded file
        cy.wait(3000) // eslint-disable-line cypress/no-unnecessary-waiting
        cy.waitUntil(
            () => cy.task('getLastDownloadFilePath').then((result) => result),
            { timeout: 3000, interval: 100 }
        ).then((filePath) => {
            expect(filePath).to.include(mapWithThematicLayer.downloadFileName)

            cy.readFile(filePath, EXTENDED_TIMEOUT).should((buffer) =>
                expect(buffer.length).to.be.gt(10000)
            )
        })

        // leave download mode
        cy.get('button').contains('Exit download mode').click()
        cy.url().should('contain', `/#/${mapWithThematicLayer.id}`)
        cy.url().should('not.contain', '/download')
        cy.getByDataTest('headerbar-title').should('be.visible')
        cy.getByDataTest('download-settings').should('not.exist')
        cy.get('[data-test="layercard"]')
            .find('h2')
            .contains(mapWithThematicLayer.cardTitle, EXTENDED_TIMEOUT)
    })
})
