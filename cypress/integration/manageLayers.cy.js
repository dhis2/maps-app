import { EXTENDED_TIMEOUT, getApiBaseUrl } from '../support/util.js'

const MAPS_ADMIN_AUTHORITY_ID = 'F_EXTERNAL_MAP_LAYER_PUBLIC_ADD'

context('Manage Layers', () => {
    beforeEach(() => {
        cy.visit('/', EXTENDED_TIMEOUT)
    })

    let numberOfLayers

    it('with maps-management authority (default)', () => {
        cy.request({
            method: 'GET',
            url: `${getApiBaseUrl()}/api/me/authorization/${MAPS_ADMIN_AUTHORITY_ID}`,
            headers: {
                'Content-Type': 'text/plain',
            },
        }).then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body).to.eq(true)
        })
    })

    it('check modal behavior', () => {
        cy.intercept(
            'GET',
            `${getApiBaseUrl()}/api/40/me?fields=id%2Cusername%2CdisplayName~rename(name)%2Cauthorities%2Csettings%5BkeyAnalysisDisplayProperty%5D`,
            (request) => {
                delete request.headers['if-none-match']
            }
        ).as('getAuthorization')

        cy.wait('@getAuthorization', EXTENDED_TIMEOUT).then(() => {
            cy.getByDataTest('add-layer-button').click()
            cy.getByDataTest('addlayerpopover').should('be.visible')
            cy.getByDataTest('managelayers-button').should('be.visible')
            cy.getByDataTest('managelayers-button').contains(
                'Manage available layers'
            )
            cy.getByDataTest('managelayers-button').click()
            cy.getByDataTest('addlayerpopover').should('not.exist')

            cy.getByDataTest('earthenginemodal').should('be.visible')
            cy.getByDataTest('earthenginemodal-title').should('be.visible')
            cy.getByDataTest('earthenginemodal-content').should('be.visible')
            cy.getByDataTest('earthenginelayer-checkbox')
                .its('length')
                .should('be.gte', 1)
            cy.getByDataTest('earthenginemodal-actions').should('be.visible')
            cy.getByDataTest('earthenginemodal-button')
                .contains('Close')
                .should('be.visible')
            cy.getByDataTest('earthenginemodal-button').click()
            cy.getByDataTest('earthenginemodal').should('not.exist')
        })
    })

    it('add and remove layers', () => {
        cy.log('count default layers (n)')
        cy.getByDataTest('add-layer-button').click()
        cy.getByDataTest('addlayerpopover')
            .find('[class^="Layer_container"]')
            .then((elements) => {
                numberOfLayers = elements.length
                cy.log(`${numberOfLayers} layers`)
            })

        Cypress.Commands.add('waitForLayerContainers', () => {
            cy.getByDataTest('addlayerpopover', EXTENDED_TIMEOUT)
                .find('[class^="Layer_container"]')
                .should('have.length.greaterThan', numberOfLayers)
        })
        Cypress.Commands.add('waitForCheckbox', (index, assertion) => {
            cy.getByDataTest('earthenginelayer-checkbox', EXTENDED_TIMEOUT)
                .eq(index)
                .find('input')
                .should(assertion)
        })

        cy.log('add one layer')
        cy.getByDataTest('managelayers-button').click()
        cy.getByDataTest('earthenginelayer-checkbox').eq(0).click()
        cy.getByDataTest('earthenginemodal-button').click()

        cy.log('check there is n+1 layers available')
        cy.getByDataTest('add-layer-button').click()
        cy.waitForLayerContainers().then((elements) => {
            cy.wrap(elements.length).should('equal', numberOfLayers + 1)
        })

        cy.log('verify the box of the layer is checked')
        cy.getByDataTest('managelayers-button').click()
        cy.waitForCheckbox(0, 'be.checked')

        cy.log('add one more layer')
        cy.getByDataTest('earthenginelayer-checkbox').eq(1).click()
        cy.getByDataTest('earthenginemodal-button').click()

        cy.log('check there is n+2 layers available')
        cy.getByDataTest('add-layer-button').click()
        cy.waitForLayerContainers().then((elements) => {
            cy.wrap(elements.length).should('equal', numberOfLayers + 2)
        })

        cy.log('verify the box of the layer is checked')
        cy.getByDataTest('managelayers-button').click()
        cy.waitForCheckbox(1, 'be.checked')

        cy.log('remove one layer')
        cy.getByDataTest('earthenginelayer-checkbox').eq(0).click()
        cy.getByDataTest('earthenginemodal-button').click()

        cy.log('check there is n+1 layers available')
        cy.getByDataTest('add-layer-button').click()
        cy.waitForLayerContainers().then((elements) => {
            cy.wrap(elements.length).should('equal', numberOfLayers + 1)
        })

        cy.log('verify the box of the layer is checked')
        cy.getByDataTest('managelayers-button').click()
        cy.waitForCheckbox(0, 'not.be.checked')
        cy.getByDataTest('earthenginemodal-button').click()
    })

    it('without maps-management authority', () => {
        cy.intercept(
            'GET',
            `${getApiBaseUrl()}/api/40/me?fields=id%2Cusername%2CdisplayName~rename(name)%2Cauthorities%2Csettings%5BkeyAnalysisDisplayProperty%5D`,
            (request) => {
                delete request.headers['if-none-match']
                request.continue((response) => {
                    if (response.body.authorities) {
                        response.body.authorities = ['M_dhis-web-mapping']
                    }
                })
            }
        ).as('getAuthorization')

        cy.wait('@getAuthorization', EXTENDED_TIMEOUT).then((interception) => {
            cy.log(interception.response.body.authorities)
            expect(interception.response.body.authorities).to.deep.equal([
                'M_dhis-web-mapping',
            ])

            Cypress.Commands.add('waitForLayerContainers', () => {
                cy.getByDataTest('addlayerpopover', EXTENDED_TIMEOUT)
                    .find('[class^="Layer_container"]')
                    .should('have.length.greaterThan', numberOfLayers)
            })
            cy.getByDataTest('add-layer-button').click()
            cy.waitForLayerContainers().then((elements) => {
                cy.wrap(elements.length).should('equal', numberOfLayers + 1)
            })
            cy.getByDataTest('managelayers-button').should('not.exist')
        })
    })

    it('datastore is not available', () => {
        cy.request({
            method: 'PUT',
            url: `${getApiBaseUrl()}/api/40/dataStore/MAPS_APP/EARTH_ENGINE_LAYERS`,
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: {
                not: 'expected',
            },
        }).then((response) => {
            expect(response.status).to.eq(200)

            cy.getByDataTest('add-layer-button').click()
            cy.getByDataTest('addlayerpopover').should('be.visible')

            cy.intercept(
                'GET',
                `${getApiBaseUrl()}/api/40/dataStore/MAPS_APP/EARTH_ENGINE_LAYERS`,
                (request) => {
                    delete request.headers['if-none-match']
                }
            ).as('getDataStore')

            cy.wait('@getDataStore', EXTENDED_TIMEOUT).then((interception) => {
                cy.log(interception.response)
            })

            cy.request({
                method: 'PUT',
                url: `${getApiBaseUrl()}/api/40/dataStore/MAPS_APP/EARTH_ENGINE_LAYERS`,
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8',
                },
                body: [],
            })
        })
    })
})
