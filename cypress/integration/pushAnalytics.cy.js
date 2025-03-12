import { EXTENDED_TIMEOUT } from '../support/util'

describe('push-analytics', () => {
    it(['>=41'], 'has a push-analytics.json file', () => {
        cy.visit('/')
        cy.request('push-analytics.json').as('file')

        cy.get('@file').should((response) => {
            expect(response.status).to.equal(200)
            expect(response.body).to.have.property('version')
            expect(response.body).to.have.property('showVisualization')
            expect(response.body).to.have.property('triggerDownload')
            expect(response.body).to.have.property('obtainDownloadArtifact')
            expect(response.body).to.have.property('clearVisualization')
        })
    })
    it(
        ['>=41'],
        'can download a file using the instructions in the push-analytics.json',
        () => {
            /* This is a simplified version of the tests in `mapDownload.cy.js`.
             * This test will start failing when the file download mechanism is
             * updated. Once this happens an update to the `push-analytics.json`
             * file is required and if the new file download mechanism is not
             * yet supported by the push-analytics service, this will need to
             * be updated as well. */
            const mapWithThematicLayer = {
                id: 'eDlFx0jTtV9',
                name: 'ANC: LLITN Cov Chiefdom this year',
                downloadFileName: 'ANC LLITN Cov Chiefdom this year.png',
                cardTitle: 'ANC LLITN coverage',
            }
            cy.task('emptyDownloadsFolder')

            cy.visit(`/#/${mapWithThematicLayer.id}`, EXTENDED_TIMEOUT)

            cy.getByDataTest('dhis2-analytics-hovermenubar')
                .find('button')
                .contains('Download')
                .should('be.visible')
                .click()

            cy.getByDataTest('download-settings')
                .find('button')
                .contains('Download')
                .click()

            cy.wait(3000) // eslint-disable-line cypress/no-unnecessary-waiting
            cy.waitUntil(
                () =>
                    cy.task('getLastDownloadFilePath').then((result) => result),
                { timeout: 3000, interval: 100 }
            ).then((filePath) => {
                expect(filePath).to.include(
                    mapWithThematicLayer.downloadFileName
                )

                cy.readFile(filePath, EXTENDED_TIMEOUT).should((buffer) =>
                    expect(buffer.length).to.be.gt(10000)
                )
            })
        }
    )
})
