import { ThematicLayer } from '../elements/thematic_layer.js'
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

    it('uses the correct name property', () => {
        cy.request({
            method: 'POST',
            url: `${getApiBaseUrl()}/api/userSettings/keyAnalysisDisplayProperty`,
            headers: {
                'Content-Type': 'text/plain',
            },
            body: 'shortName',
        }).then((response) => {
            expect(response.status).to.eq(200)

            cy.visit('/')
            const ThemLayer = new ThematicLayer()
            ThemLayer.openDialog('Thematic')
                .selectIndicatorGroup('ANC')
                .selectIndicator('ANC visit clinical prof')

            ThemLayer.selectItemType('Data element')
                .selectDataElementGroup('Acute Flaccid Paralysis (AFP)')
                .selectDataElement('AFP follow-up')

            cy.get('input[type=radio][value=details]').click()
            ThemLayer.selectDataElementOperand('AFP follow-up 0-11m')

            cy.request({
                method: 'POST',
                url: `${getApiBaseUrl()}/api/userSettings/keyAnalysisDisplayProperty`,
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: 'name',
            }).then((response) => {
                expect(response.status).to.eq(200)

                cy.visit('/')
                const ThemLayer = new ThematicLayer()
                ThemLayer.openDialog('Thematic')
                    .selectIndicatorGroup('ANC')
                    .selectIndicator('ANC visits per clinical professional')

                ThemLayer.selectItemType('Data element')
                    .selectDataElementGroup('Acute Flaccid Paralysis (AFP)')
                    .selectDataElement(
                        'Acute Flaccid Paralysis (AFP) follow-up'
                    )

                cy.get('input[type=radio][value=details]').click()
                ThemLayer.selectDataElementOperand(
                    'Acute Flaccid Paralysis (AFP) follow-up 0-11m'
                )
            })
        })
    })
})
