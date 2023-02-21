import { EXTENDED_TIMEOUT } from '../support/util.js'

const USER_SETTINGS_ENDPOINT = { method: 'GET', url: 'userSettings?*' }

const testMap = {
    id: 'eDlFx0jTtV9',
    name: 'ANC: LLITN Cov Chiefdom this year',
    downloadName: 'ANC_LLITN_coverage.geojson',
    cardTitle: 'ANC LLITN coverage',
}

describe('userSettings', () => {
    beforeEach(() => {
        cy.intercept(USER_SETTINGS_ENDPOINT, (req) => {
            delete req.headers['if-none-match']
            req.continue()
        })
    })

    it('shows the app in Spanish', () => {
        cy.intercept(USER_SETTINGS_ENDPOINT, (req) => {
            delete req.headers['if-none-match']
            req.continue((res) => {
                res.body.keyUiLocale = 'es'

                res.send({
                    body: res.body,
                })
            })
        })

        cy.visit(`/?id=${testMap.id}`)
        cy.get('[data-test=layercard]')
            .find('h2')
            .contains(`${testMap.cardTitle}`)
            .should('be.visible')

        cy.contains('Fichero', EXTENDED_TIMEOUT).should('be.visible')
        cy.contains('File').should('not.exist')
        cy.contains('Descargar').should('be.visible')
        cy.contains('Download').should('not.exist')

        cy.contains('Interpretaciones').click()
        cy.get('div').contains('John Kamara').click()

        cy.contains('14 de may.').should('be.visible')
    })

    it('shows the app in English', () => {
        cy.visit(`/?id=${testMap.id}`)
        cy.get('[data-test=layercard]')
            .find('h2')
            .contains(`${testMap.cardTitle}`)
            .should('be.visible')

        cy.contains('File', EXTENDED_TIMEOUT).should('be.visible')
        cy.contains('Fichero').should('not.exist')
        cy.contains('Descargar').should('not.exist')
        cy.contains('Download').should('be.visible')

        cy.contains('Interpretations').click()
        cy.get('div').contains('John Kamara').click()

        cy.contains('May 14').should('be.visible')
    })
})
