import { EXTENDED_TIMEOUT, getApiBaseUrl } from '../support/util.js'

const MAPS_ADMIN_AUTHORITY_ID = 'F_EXTERNAL_MAP_LAYER_PUBLIC_ADD'
const MAPS_APP_NAMESPACE = 'DHIS2_MAPS_APP_CORE'
const LAYER_TYPES_VISIBILITY_KEY = 'LAYER_TYPES_VISIBILITY_SETTING'
const LAYER_TYPES_VISIBILITY_DEFAULT = 7

context('Manage Layers', () => {
    beforeEach(() => {
        cy.visit('/', EXTENDED_TIMEOUT)
    })

    // Define variable to count layerTypes available after adding/removing
    let numberOfLayers

    it('w/ maps-mngmt auth - check it is set by default with admin user', () => {
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

    it('w/ maps-mngmt auth - check add layer popover and modal behavior', () => {
        cy.intercept(
            'GET',
            '**/me?fields=id%2Cusername%2CdisplayName~rename(name)%2Cauthorities%2Csettings%5BkeyAnalysisDisplayProperty%5D',
            (request) => {
                delete request.headers['if-none-match']
            }
        ).as('getAuthorization')

        cy.wait('@getAuthorization', EXTENDED_TIMEOUT).then(() => {
            // Opening add layer popover and checking content
            cy.getByDataTest('add-layer-button').click()
            cy.getByDataTest('addlayerpopover').should('be.visible')
            cy.getByDataTest('managelayers-button').should('be.visible')
            cy.getByDataTest('managelayers-button').contains(
                'Manage available layers'
            )

            // Opening manage layers modal and checking content
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

            // Closing manage layers modal
            cy.getByDataTest('earthenginemodal-button').click()
            cy.getByDataTest('earthenginemodal').should('not.exist')
        })
    })

    it('w/ or w/o maps-mngmt auth - check datastore compromized integrity is not affecting user experience', () => {
        // Compromize datastore integrity (pass an object instead of an array)
        cy.request({
            method: 'PUT',
            url: `${getApiBaseUrl()}/api/dataStore/${MAPS_APP_NAMESPACE}/${LAYER_TYPES_VISIBILITY_KEY}`,
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

            // Check that at least default layers are still available
            cy.getByDataTest('addlayerpopover')
                .find('[class^="Layer_container"]')
                .should('have.length.gte', 6)
        })
    })

    it('w/ or w/o maps-mngmt auth - check datastore integrity is restored on load', () => {
        cy.request({
            method: 'GET',
            url: `${getApiBaseUrl()}/api/dataStore/${MAPS_APP_NAMESPACE}/${LAYER_TYPES_VISIBILITY_KEY}`,
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
            },
        }).then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body)
                .to.be.an('array')
                .that.has.lengthOf(LAYER_TYPES_VISIBILITY_DEFAULT)
        })
    })

    it('w/ maps-mngmt auth - add and remove layers', () => {
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
                .should('have.length.lte', numberOfLayers)
        })
        Cypress.Commands.add('waitForCheckbox', (index, assertion) => {
            cy.getByDataTest('earthenginelayer-checkbox', EXTENDED_TIMEOUT)
                .eq(index)
                .find('input')
                .should(assertion)
        })

        cy.log('remove one layer')
        cy.getByDataTest('managelayers-button').click()
        cy.getByDataTest('earthenginelayer-checkbox').eq(0).click()
        cy.getByDataTest('earthenginemodal-button').click()

        cy.log('check there is n-1 layers available')
        cy.getByDataTest('add-layer-button').click()
        cy.waitForLayerContainers().then((elements) => {
            cy.wrap(elements.length).should('equal', numberOfLayers - 1)
        })

        cy.log('verify the box of the layer is not checked')
        cy.getByDataTest('managelayers-button').click()
        cy.waitForCheckbox(0, 'not.be.checked')

        cy.log('remove one more layer')
        cy.getByDataTest('earthenginelayer-checkbox').eq(1).click()
        cy.getByDataTest('earthenginemodal-button').click()

        cy.log('check there is n-2 layers available')
        cy.getByDataTest('add-layer-button').click()
        cy.waitForLayerContainers().then((elements) => {
            cy.wrap(elements.length).should('equal', numberOfLayers - 2)
        })

        cy.log('verify the box of the layer is not checked')
        cy.getByDataTest('managelayers-button').click()
        cy.waitForCheckbox(1, 'not.be.checked')

        cy.log('add one layer')
        cy.getByDataTest('earthenginelayer-checkbox').eq(0).click()
        cy.getByDataTest('earthenginemodal-button').click()

        cy.log('check there is n layers available')
        cy.getByDataTest('add-layer-button').click()
        cy.waitForLayerContainers().then((elements) => {
            cy.wrap(elements.length).should('equal', numberOfLayers - 1)
        })

        cy.log('verify the box of the layers are checked')
        cy.getByDataTest('managelayers-button').click()
        cy.waitForCheckbox(0, 'be.checked')
        cy.getByDataTest('earthenginemodal-button').click()
    })

    it('w/o maps-mngmt auth - check add layer popover behavior', () => {
        cy.intercept(
            'GET',
            '**/me?fields=id%2Cusername%2CdisplayName~rename(name)%2Cauthorities%2Csettings%5BkeyAnalysisDisplayProperty%5D',
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

            // Checks that settings are persisted
            Cypress.Commands.add('waitForLayerContainers', () => {
                cy.getByDataTest('addlayerpopover', EXTENDED_TIMEOUT)
                    .find('[class^="Layer_container"]')
                    .should('have.length.lte', numberOfLayers)
            })
            cy.getByDataTest('add-layer-button').click()
            cy.waitForLayerContainers().then((elements) => {
                cy.wrap(elements.length).should('equal', numberOfLayers - 1)
            })

            // Checks that manage layers modal is not accessible
            cy.getByDataTest('managelayers-button').should('not.exist')
        })
    })
})
