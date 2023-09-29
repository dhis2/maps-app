import { EXTENDED_TIMEOUT, getApiBaseUrl } from '../support/util.js'

const testMap = {
    id: 'ZBjCfSaLSqD',
    name: 'ANC: LLITN coverage district and facility',
    cardTitle: 'ANC LLITN coverage',
}

describe('userSettings', () => {
    it('shows the app in Norwegian', () => {
        cy.request({
            method: 'POST',
            url: `${getApiBaseUrl()}/api/userSettings/keyUiLocale`,
            headers: {
                'Content-Type': 'text/plain',
            },
            body: 'nb',
        }).then((response) => {
            expect(response.status).to.eq(200)
            cy.log('language switched to', response.message)

            cy.visit(`/?id=${testMap.id}`)
            cy.get('[data-test=layercard]')
                .find('h2')
                .contains(`${testMap.cardTitle}`)
                .should('be.visible')

            cy.containsExact('Fil', EXTENDED_TIMEOUT).should('be.visible')
            cy.contains('File').should('not.exist')
            cy.contains('Last ned').should('be.visible')
            cy.contains('Download').should('not.exist')

            // TODO - updated component, this isn't translated yet
            // cy.contains('Tolkninger').click()
            // cy.getByDataTest('interpretations-list')
            //     .find('.date-section')
            //     .contains('14. mai 2021')
            //     .should('be.visible')

            cy.request({
                method: 'POST',
                url: `${getApiBaseUrl()}/api/userSettings/keyUiLocale`,
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: 'en',
            }).then((response) => {
                expect(response.status).to.eq(200)

                cy.visit(`/?id=${testMap.id}`)
                cy.get('[data-test=layercard]')
                    .find('h2')
                    .contains(`${testMap.cardTitle}`)
                    .should('be.visible')

                cy.contains('File', EXTENDED_TIMEOUT).should('be.visible')
                cy.containsExact('Fil').should('not.exist')
                cy.contains('Last ned').should('not.exist')
                cy.contains('Download').should('be.visible')

                cy.contains('Interpretations and details').click()
                cy.getByDataTest('interpretations-list')
                    .find('.date-section')
                    .contains('May 14')
                    .should('be.visible')
            })
        })
    })
})
