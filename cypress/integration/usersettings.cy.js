import { EXTENDED_TIMEOUT } from '../support/util.js'

//both endpoints provide the user setting keyUiLocale
const USER_SETTINGS_ENDPOINT = { method: 'GET', url: 'userSettings*' }
const ME_ENDPOINT = { method: 'GET', url: 'me?*' }

const testMap = {
    id: 'ZBjCfSaLSqD',
    name: 'ANC: LLITN coverage district and facility',
    cardTitle: 'ANC LLITN coverage',
}

describe('userSettings', () => {
    beforeEach(() => {
        cy.intercept(USER_SETTINGS_ENDPOINT, (req) => {
            delete req.headers['if-none-match']
            req.continue()
        })
    })

    it('shows the app in Norwegian', () => {
        cy.intercept(USER_SETTINGS_ENDPOINT, (req) => {
            delete req.headers['if-none-match']
            req.continue((res) => {
                res.body.keyUiLocale = 'nb'

                res.send({
                    body: res.body,
                })
            })
        })

        cy.intercept(ME_ENDPOINT, (req) => {
            delete req.headers['if-none-match']
            req.continue((res) => {
                res.body.settings.keyUiLocale = 'nb'

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

        cy.containsExact('Fil', EXTENDED_TIMEOUT).should('be.visible')
        cy.contains('File').should('not.exist')
        cy.contains('Last ned').should('be.visible')
        cy.contains('Download').should('not.exist')

        cy.contains('Tolkninger').click()
        cy.get('div').contains('John Kamara').click()

        cy.contains('14. mai 2021').should('be.visible')
    })

    it('shows the app in English', () => {
        cy.intercept(USER_SETTINGS_ENDPOINT, (req) => {
            delete req.headers['if-none-match']
            req.continue((res) => {
                res.body.keyUiLocale = 'en'

                res.send({
                    body: res.body,
                })
            })
        })

        cy.intercept(ME_ENDPOINT, (req) => {
            delete req.headers['if-none-match']
            req.continue((res) => {
                res.body.settings.keyUiLocale = 'en'

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

        cy.contains('File', EXTENDED_TIMEOUT).should('be.visible')
        cy.containsExact('Fil').should('not.exist')
        cy.contains('Last ned').should('not.exist')
        cy.contains('Download').should('be.visible')

        cy.contains('Interpretations').click()
        cy.get('div').contains('John Kamara').click()

        cy.contains('May 14').should('be.visible')
    })
})
