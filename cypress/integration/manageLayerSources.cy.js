import { EXTENDED_TIMEOUT, getApiBaseUrl } from '../support/util.js'

const MAPS_ADMIN_AUTHORITY_ID = 'F_EXTERNAL_MAP_LAYER_PUBLIC_ADD'
const MAPS_APP_NAMESPACE = 'DHIS2_MAPS_APP_CORE'
const MAPS_APP_KEY_MANAGED_LAYER_SOURCES = 'MANAGED_LAYER_SOURCES'
const LAYER_SOURCES_DEFAULT_MANAGED_LIST = [
    'WorldPop/GP/100m/pop_age_sex_cons_unadj_TOTAL',
    'WorldPop/GP/100m/pop_age_sex_cons_unadj',
    'ECMWF/ERA5_LAND/MONTHLY_AGGR/total_precipitation_sum',
    'ECMWF/ERA5_LAND/MONTHLY_AGGR/temperature_2m',
    'MODIS/006/MCD12Q1',
    'USGS/SRTMGL1_003',
    'GOOGLE/Research/open-buildings/v1/polygons',
]
const LAYER_SOURCES_DEFAULT_MANAGED = LAYER_SOURCES_DEFAULT_MANAGED_LIST.length
const LAYER_SOURCES_DEFAULT_STANDARD = 6
const LAYER_SOURCES_DEFAULT_ALL =
    LAYER_SOURCES_DEFAULT_MANAGED + LAYER_SOURCES_DEFAULT_STANDARD

context('Manage Layer Sources', () => {
    it('admin authority is already available for current user', () => {
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

    it('w/ admin authority: check add layer popover and managelayersources modal behavior and content', () => {
        // Make sure authority request response is not comming from cache
        cy.intercept(
            'GET',
            '**/me?fields=id%2Cusername%2CdisplayName~rename(name)%2Cauthorities%2Csettings%5BkeyAnalysisDisplayProperty%5D',
            (request) => {
                delete request.headers['if-none-match']
            }
        ).as('getAuthorization')

        // Visit page
        cy.visit('/', EXTENDED_TIMEOUT)

        // Opening add layer popover and checking content
        cy.getByDataTest('add-layer-button').click()
        cy.getByDataTest('addlayerpopover').should('be.visible')
        cy.getByDataTest('managelayersources-button').should('be.visible')
        cy.getByDataTest('managelayersources-button').contains(
            'Manage available layer sources'
        )

        // Opening manage layers modal and checking content
        cy.getByDataTest('managelayersources-button').click()
        cy.getByDataTest('addlayerpopover').should('not.exist')
        cy.getByDataTest('managelayersourcesmodal').should('be.visible')
        cy.getByDataTest('managelayersourcesmodal-title').should('be.visible')
        cy.getByDataTest('managelayersourcesmodal-content').should('be.visible')
        cy.getByDataTest('layersource-checkbox')
            .its('length')
            .should('be.gte', 1)
        cy.getByDataTest('managelayersourcesmodal-actions').should('be.visible')
        cy.getByDataTest('managelayersourcesmodal-button')
            .contains('Close')
            .should('be.visible')

        // Closing manage layers modal
        cy.getByDataTest('managelayersourcesmodal-button').click()
        cy.getByDataTest('managelayersourcesmodal').should('not.exist')
    })

    it('w/ admin authority: add and remove layers', () => {
        Cypress.Commands.add('waitForLayerContainers', (n) => {
            cy.getByDataTest('addlayerpopover', EXTENDED_TIMEOUT)
                .find('[class^="Layer_container"]')
                .should('have.length', n)
        })
        Cypress.Commands.add('waitForCheckbox', (index, assertion) => {
            cy.getByDataTest('layersource-checkbox', EXTENDED_TIMEOUT)
                .eq(index)
                .find('input')
                .should(assertion)
        })

        // Replace dataStore with default layer sources visibility list
        cy.request({
            method: 'PUT',
            url: `${getApiBaseUrl()}/api/dataStore/${MAPS_APP_NAMESPACE}/${MAPS_APP_KEY_MANAGED_LAYER_SOURCES}`,
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: LAYER_SOURCES_DEFAULT_MANAGED_LIST,
        }).then((response) => {
            expect(response.status).to.eq(200)
        })

        // Visit page
        cy.visit('/', EXTENDED_TIMEOUT)

        cy.getByDataTest('add-layer-button').click()

        cy.log('remove one layer')
        cy.getByDataTest('managelayersources-button').click()
        cy.waitForCheckbox(0, 'be.checked')
        cy.getByDataTest('layersource-checkbox').eq(0).click()
        cy.getByDataTest('managelayersourcesmodal-button').click()

        cy.log('check there is n-1 layers available')
        cy.getByDataTest('add-layer-button').click()
        const n1 = LAYER_SOURCES_DEFAULT_ALL - 1
        cy.waitForLayerContainers(n1).then((elements) => {
            cy.wrap(elements.length).should('equal', n1)
        })

        cy.log('verify the checkbox of the first layer is not checked')
        cy.getByDataTest('managelayersources-button').click()
        cy.waitForCheckbox(0, 'not.be.checked')

        cy.log('remove one more layer')
        cy.waitForCheckbox(1, 'be.checked')
        cy.getByDataTest('layersource-checkbox').eq(1).click()
        cy.getByDataTest('managelayersourcesmodal-button').click()

        cy.log('check there is n-2 layers available')
        cy.getByDataTest('add-layer-button').click()
        const n2 = LAYER_SOURCES_DEFAULT_ALL - 2
        cy.waitForLayerContainers(n2).then((elements) => {
            cy.wrap(elements.length).should('equal', n2)
        })

        cy.log('verify the checkbox of the second layer is not checked')
        cy.getByDataTest('managelayersources-button').click()
        cy.waitForCheckbox(1, 'not.be.checked')

        cy.log('add one layer')
        cy.waitForCheckbox(0, 'not.be.checked')
        cy.getByDataTest('layersource-checkbox').eq(0).click()
        cy.getByDataTest('managelayersourcesmodal-button').click()

        cy.log('check there is n-1 layers available')
        cy.getByDataTest('add-layer-button').click()
        const n3 = LAYER_SOURCES_DEFAULT_ALL - 1
        cy.waitForLayerContainers(n3).then((elements) => {
            cy.wrap(elements.length).should('equal', n3)
        })

        cy.log('verify the checkbox of the first layer is checked')
        cy.getByDataTest('managelayersources-button').click()
        cy.waitForCheckbox(0, 'be.checked')
        cy.getByDataTest('managelayersourcesmodal-button').click()

        // Restore dataStore with default layer sources visibility list
        cy.request({
            method: 'PUT',
            url: `${getApiBaseUrl()}/api/dataStore/${MAPS_APP_NAMESPACE}/${MAPS_APP_KEY_MANAGED_LAYER_SOURCES}`,
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: LAYER_SOURCES_DEFAULT_MANAGED_LIST,
        }).then((response) => {
            expect(response.status).to.eq(200)
        })
    })

    it('w/o admin authority: check managelayersources button is hidden', () => {
        Cypress.Commands.add('waitForLayerContainers', (n) => {
            cy.getByDataTest('addlayerpopover', EXTENDED_TIMEOUT)
                .find('[class^="Layer_container"]')
                .should('have.length', n)
        })

        // Remove admin authority
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

        // Replace dataStore with default layer sources visibility list -1
        cy.request({
            method: 'PUT',
            url: `${getApiBaseUrl()}/api/dataStore/${MAPS_APP_NAMESPACE}/${MAPS_APP_KEY_MANAGED_LAYER_SOURCES}`,
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: LAYER_SOURCES_DEFAULT_MANAGED_LIST.slice(0, -1),
        }).then((response) => {
            expect(response.status).to.eq(200)
        })

        // Visit page
        cy.visit('/', EXTENDED_TIMEOUT)

        cy.wait('@getAuthorization', EXTENDED_TIMEOUT).then((interception) => {
            cy.log(interception.response.body.authorities)
            expect(interception.response.body.authorities).to.deep.equal([
                'M_dhis-web-mapping',
            ])

            // Checks that settings are persisted
            cy.getByDataTest('add-layer-button').click()
            const n4 = LAYER_SOURCES_DEFAULT_ALL - 1
            cy.waitForLayerContainers(n4).then((elements) => {
                cy.wrap(elements.length).should('equal', n4)
            })

            // Checks that manage layers modal is not accessible
            cy.getByDataTest('managelayers-button').should('not.exist')
        })

        // Restore dataStore with default layer sources visibility list
        cy.request({
            method: 'PUT',
            url: `${getApiBaseUrl()}/api/dataStore/${MAPS_APP_NAMESPACE}/${MAPS_APP_KEY_MANAGED_LAYER_SOURCES}`,
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: LAYER_SOURCES_DEFAULT_MANAGED_LIST,
        }).then((response) => {
            expect(response.status).to.eq(200)
        })
    })

    it('at start, if dataStore = [], app initializes namespace', () => {
        Cypress.Commands.add('waitForLayerContainers', (n) => {
            cy.getByDataTest('addlayerpopover', EXTENDED_TIMEOUT)
                .find('[class^="Layer_container"]')
                .should('have.length', n)
        })

        // Mock empty dataStore
        cy.intercept('GET', '**/dataStore', (request) => {
            delete request.headers['if-none-match']
            request.continue((response) => {
                response.send([])
            })
        }).as('getDataStoreEmpty')

        // Checks app sends namespace initialization request
        cy.intercept(
            'POST',
            `**/dataStore/${MAPS_APP_NAMESPACE}/${MAPS_APP_KEY_MANAGED_LAYER_SOURCES}`,
            (request) => {
                expect(request.body)
                    .to.be.an('array')
                    .that.has.lengthOf(LAYER_SOURCES_DEFAULT_MANAGED)
                // Mock response (request is not actually sent)
                request.reply({
                    statusCode: 200,
                })
            }
        ).as('postNamespaceDefault')

        // Visit page
        cy.visit('/', EXTENDED_TIMEOUT)

        cy.wait('@getDataStoreEmpty', EXTENDED_TIMEOUT).then(() => {
            cy.wait('@postNamespaceDefault', EXTENDED_TIMEOUT).then(() => {
                // Verify default layer sources are available
                cy.getByDataTest('add-layer-button').click()
                const n0 = LAYER_SOURCES_DEFAULT_ALL
                cy.waitForLayerContainers(n0).then((elements) => {
                    cy.wrap(elements.length).should('equal', n0)
                })
            })
        })
    })

    it('at start, if namespace = {}, app re-initializes namespace', () => {
        Cypress.Commands.add('waitForLayerContainers', (n) => {
            cy.getByDataTest('addlayerpopover', EXTENDED_TIMEOUT)
                .find('[class^="Layer_container"]')
                .should('have.length', n)
        })

        // Mock object namespace
        cy.intercept(
            'GET',
            `**/dataStore/${MAPS_APP_NAMESPACE}/${MAPS_APP_KEY_MANAGED_LAYER_SOURCES}`,
            (request) => {
                delete request.headers['if-none-match']
                request.continue((response) => {
                    response.send({ invalid: 'fromat' })
                })
            }
        ).as('getNamespaceObject')

        // Checks app sends namespace re-initialization request
        cy.intercept(
            'PUT',
            `**/dataStore/${MAPS_APP_NAMESPACE}/${MAPS_APP_KEY_MANAGED_LAYER_SOURCES}`,
            (request) => {
                expect(request.body)
                    .to.be.an('array')
                    .that.has.lengthOf(LAYER_SOURCES_DEFAULT_MANAGED)
                // Mock response (request is not actually sent)
                request.reply({
                    statusCode: 200,
                })
            }
        ).as('putNamespaceDefault')

        // Visit page
        cy.visit('/', EXTENDED_TIMEOUT)

        cy.wait('@getNamespaceObject', EXTENDED_TIMEOUT).then(() => {
            cy.wait('@putNamespaceDefault', EXTENDED_TIMEOUT).then(() => {
                // Verify default layer sources are available
                cy.getByDataTest('add-layer-button').click()
                const n0 = LAYER_SOURCES_DEFAULT_ALL
                cy.waitForLayerContainers(n0).then((elements) => {
                    cy.wrap(elements.length).should('equal', n0)
                })
            })
        })
    })

    it('at start, if "invalid_source_id" in namespace, app ignores id', () => {
        Cypress.Commands.add('waitForLayerContainers', (n) => {
            cy.getByDataTest('addlayerpopover', EXTENDED_TIMEOUT)
                .find('[class^="Layer_container"]')
                .should('have.length', n)
        })

        // Mock "invalid_source_id" in namespace
        cy.intercept(
            'GET',
            `**/dataStore/${MAPS_APP_NAMESPACE}/${MAPS_APP_KEY_MANAGED_LAYER_SOURCES}`,
            (request) => {
                delete request.headers['if-none-match']
                request.continue((response) => {
                    response.send([...response.body, 'invalid_source_id'])
                })
            }
        ).as('getNamespaceArray')

        // Visit page
        cy.visit('/', EXTENDED_TIMEOUT)

        cy.wait('@getNamespaceArray', EXTENDED_TIMEOUT).then(() => {
            // Verify default layer sources are available
            cy.getByDataTest('add-layer-button').click()
            const n0 = LAYER_SOURCES_DEFAULT_ALL
            cy.waitForLayerContainers(n0).then((elements) => {
                cy.wrap(elements.length).should('equal', n0)
            })
        })
    })
})
