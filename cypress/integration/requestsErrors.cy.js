import { getRequest } from '../support/requests.js'
import { assertIntercepts, getDhis2Version } from '../support/util.js'

const EXTENDED_TIMEOUT = { timeout: 35000 }

const clearAndLogin = () => {
    cy.clearCookies()
    cy.clearLocalStorage()

    const username = Cypress.env('dhis2Username')
    const password = Cypress.env('dhis2Password')
    const baseUrl = Cypress.env('dhis2BaseUrl')

    cy.loginByApi({ username, password, baseUrl })
        .its('status')
        .should('equal', 200)
}

const commonTriggerFn = () => {
    cy.reload(true)
    clearAndLogin()
    cy.reload(true)
}

Cypress.on('uncaught:exception', (err) => {
    if (
        err.message.includes('Failed to fetch user locale: Error: Unauthorized')
    ) {
        return false
    }
    if (
        err.message.includes(
            'Failed to fetch user locale: Error: An unknown network error occurred'
        )
    ) {
        return false
    }
    if (
        err.message.includes(
            'Failed to fetch user ID: Error: An unknown network error occurred'
        )
    ) {
        return false
    }
})

describe('Error handling check for all layer types', () => {
    it.skip('missing map', () => {
        // !TODO: Handle error
        const id = '00000000000'
        assertIntercepts({
            intercepts: [getRequest('getMap', id)],
            commonTriggerFn: () => {
                cy.visit(`/?id=${id}`)
            },
        })
    })

    it('load thematic layer', () => {
        // E2E - Thematic Layer [tFVpGPWj7MJ]
        const id = 'tFVpGPWj7MJ'

        const commonAssertFn = ({ error }) => {
            const errorMessage = {
                network: 'An unknown network error occurred',
                409: 'Simulated error with status code 409',
            }

            cy.getByDataTest('dhis2-uicore-noticebox', EXTENDED_TIMEOUT).within(
                () => {
                    cy.contains(
                        'Failed to load layer',
                        EXTENDED_TIMEOUT
                    ).should('be.visible')
                    cy.contains(errorMessage[error], EXTENDED_TIMEOUT).should(
                        'be.visible'
                    )
                }
            )

            cy.getByDataTest('dhis2-uicore-alertstack', EXTENDED_TIMEOUT)
                .contains(`Error: ${errorMessage[error]}`, EXTENDED_TIMEOUT)
                .should('be.visible')
        }

        cy.visit(`/?id=${id}`)

        assertIntercepts({
            intercepts: [
                {
                    ...getRequest('getThematic_Analytics1'),
                    errors: ['network', 409],
                },
                {
                    ...getRequest('getThematic_Analytics2'),
                    errors: ['network', 409],
                },
                {
                    ...getRequest('getThematic_GeoFeatures1'),
                    errors: ['network', 409],
                },
                {
                    ...getRequest('getThematic_GeoFeatures2'),
                    errors: ['network', 409],
                },
                {
                    ...getRequest('getThematic_LegendSets'),
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
            ],
            commonTriggerFn,
            commonAssertFn,
            timeout: EXTENDED_TIMEOUT,
        })
    })

    it('load events layer w/ server cluster', () => {
        // !TODO: Improve messages, we may not need cutom handling for filters
        // E2E - Events Layer - Server Cluster [VzwBJhyad9P]
        const id = 'VzwBJhyad9P'

        const commonAssertFn = ({ error }) => {
            const errorMessage = {
                network: 'An unknown error occurred while reading layer data',
                409: "You don't have access to this layer data",
            }

            // !TODO: Display error in layer card

            cy.getByDataTest('dhis2-uicore-alertstack', EXTENDED_TIMEOUT)
                .contains(errorMessage[error], EXTENDED_TIMEOUT)
                .should('be.visible')
        }

        cy.visit(`/?id=${id}`)

        assertIntercepts({
            intercepts: [
                {
                    ...getRequest('getEventsCluster_Analytics1'),
                    statusCode: 409,
                    body: {
                        httpStatus: 'Conflict',
                        httpStatusCode: 409,
                        status: 'ERROR',
                        message:
                            'Query item or filter is invalid: `qrur9Dvnyt5:GT:;LT:10`',
                        errorCode: 'E7222',
                    },
                    assertFn: () => {
                        cy.getByDataTest(
                            'dhis2-uicore-alertstack',
                            EXTENDED_TIMEOUT
                        )
                            .contains(
                                'The event filter is not supported',
                                EXTENDED_TIMEOUT
                            )
                            .should('be.visible')
                    },
                },
                {
                    ...getRequest('getEventsCluster_Analytics1'),
                    statusCode: 409,
                    body: {
                        httpStatus: 'Conflict',
                        httpStatusCode: 409,
                        status: 'ERROR',
                        message:
                            'Query filter: `5;GT` not valid for query item value type: `INTEGER`',
                        errorCode: 'E7234',
                    },
                    assertFn: () => {
                        cy.getByDataTest(
                            'dhis2-uicore-alertstack',
                            EXTENDED_TIMEOUT
                        )
                            .contains(
                                "You don't have access to this layer data",
                                EXTENDED_TIMEOUT
                            )
                            .should('be.visible')
                    },
                },
                {
                    ...getRequest('getEventsCluster_Analytics1'),
                    errors: ['network', 409], // !TODO: Improve messages
                },
                {
                    ...getRequest('getEventsCluster_Analytics2'),
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
                {
                    ...getRequest('getEventsCluster_Analytics3'),
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
                {
                    ...getRequest('getEventsCluster_Analytics4'),
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
                {
                    ...getRequest('getEventsCluster_Analytics5'),
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
                {
                    ...getRequest('getEventsCluster_Analytics6'),
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
                {
                    ...getRequest('getEventsCluster_Analytics7'),
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
                {
                    ...getRequest('getEventsCluster_ProgramStages'),
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
                {
                    ...getRequest('getEventsCluster_OptionSets'),
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
                {
                    ...getRequest('getEventsCluster_Fonts'),
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
            ],
            commonTriggerFn,
            commonAssertFn,
            timeout: EXTENDED_TIMEOUT,
        })
    })

    it('load events layer w/ coordinate field & data download', () => {
        // E2E - Events Layer - Coordinate Field [ugVIdvX2qIG]
        const id = 'ugVIdvX2qIG'

        const commonAssertFn = ({ error }) => {
            const errorMessage = {
                network: 'An unknown error occurred while reading layer data',
                409: "You don't have access to this layer data",
            }

            // !TODO: Display error in layer card

            cy.getByDataTest('dhis2-uicore-alertstack', EXTENDED_TIMEOUT)
                .contains(errorMessage[error], EXTENDED_TIMEOUT)
                .should('be.visible')
        }

        cy.visit(`/?id=${id}`)

        assertIntercepts({
            intercepts: [
                {
                    ...getRequest('getEventsStandard_Analytics1'),
                    triggerFn: () => {
                        clearAndLogin()
                        cy.visit(`/?id=${id}`)
                        cy.wait(10000) // eslint-disable-line cypress/no-unnecessary-waiting
                    },
                    errors: ['network', 409], // !TODO: Improve messages
                },
                {
                    ...getRequest('getEventsStandard_ProgramStages'),
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
                {
                    ...getRequest('getEventsStandard_OptionSets'),
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
                {
                    ...getRequest('getEventsStandard_Analytics2'),
                    triggerFn: () => {
                        clearAndLogin()
                        cy.visit(`/?id=${id}`)
                        cy.getByDataTest('layercard', EXTENDED_TIMEOUT)
                            .find('[data-test="layerlegend"]', EXTENDED_TIMEOUT)
                            .should('exist')
                        cy.getByDataTest('moremenubutton').first().click()
                        cy.getByDataTest('more-menu')
                            .find('li')
                            .contains('Download data')
                            .click()
                        cy.getByDataTest('data-download-modal')
                            .find('button')
                            .contains('Download')
                            .click()
                    },
                    assertFn: () => {
                        cy.getByDataTest(
                            'dhis2-uicore-noticebox',
                            EXTENDED_TIMEOUT
                        )
                            .contains('Data download failed.', EXTENDED_TIMEOUT)
                            .should('be.visible')
                    },
                    errors: ['network', 409],
                },
            ],
            commonTriggerFn,
            commonAssertFn,
            timeout: EXTENDED_TIMEOUT,
        })
    })

    it.skip('load tracked entities layer', () => {
        // !TODO: Handle errors
        // E2E - Tracked Entities Layer [VuYJ5LIgQo2]
        const id = 'VuYJ5LIgQo2'

        const commonAssertFn = ({ error }) => {
            const errorMessage = {
                network: 'An unknown error occurred while reading layer data',
                409: "You don't have access to this layer data",
            }

            // !TODO: Display error in layer card

            cy.getByDataTest('dhis2-uicore-alertstack', EXTENDED_TIMEOUT)
                .contains(errorMessage[error], EXTENDED_TIMEOUT)
                .should('be.visible')
        }

        cy.visit(`/?id=${id}`)

        const serverVersion = getDhis2Version()
        let layerSpecificRequests
        if (serverVersion.minor === '40') {
            layerSpecificRequests = [
                {
                    ...getRequest('getTrackedEntities40_TrackedEntities1'),
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
                {
                    ...getRequest('getTrackedEntities40_TrackedEntities2'),
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
            ]
        } else {
            layerSpecificRequests = [
                {
                    ...getRequest('getTrackedEntities41_TrackedEntities1'),
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
                {
                    ...getRequest('getTrackedEntities41_TrackedEntities2'),
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
            ]
        }

        assertIntercepts({
            intercepts: [
                ...layerSpecificRequests,
                {
                    ...getRequest('getTrackedEntities_RelationshipType'),
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
                {
                    ...getRequest('getTrackedEntities_TrackedEntityType1'),
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors (layer loads)
                },
                {
                    ...getRequest('getTrackedEntities_TrackedEntityType2'),
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors (layer loads)
                },
                {
                    ...getRequest('getTrackedEntities_Program'),
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors (layer loads)
                },
            ],
            commonTriggerFn,
            commonAssertFn,
            timeout: EXTENDED_TIMEOUT,
        })
    })

    it('load facilities layer', () => {
        // E2E - Facilities Layer [kIAUN3dInEz]
        const id = 'kIAUN3dInEz'

        cy.visit(`/?id=${id}`)

        const commonAssertFn = ({ error }) => {
            const errorMessage = {
                network: 'An unknown network error occurred',
                409: 'Simulated error with status code 409',
            }

            // !TODO: Display error in layer card

            cy.getByDataTest('dhis2-uicore-alertstack', EXTENDED_TIMEOUT)
                .contains(`Error: ${errorMessage[error]}`, EXTENDED_TIMEOUT)
                .should('be.visible')

            cy.getByDataTest('dhis2-uicore-alertstack', EXTENDED_TIMEOUT)
                .contains(
                    'No coordinates found for selected facilities',
                    EXTENDED_TIMEOUT
                )
                .should('be.visible')
        }

        assertIntercepts({
            intercepts: [
                {
                    ...getRequest('getFacilities_GeoFeatures'),
                    errors: ['network', 409],
                },
                {
                    ...getRequest('getFacilities_OrganisationUnitGroupSets'),
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
                {
                    ...getRequest('getFacilities_OUGSImage'),
                    assertFn: () => {
                        cy.getByDataTest(
                            'dhis2-uicore-alertbar',
                            EXTENDED_TIMEOUT
                        )
                            .contains('Symbol not found', EXTENDED_TIMEOUT)
                            .should('be.visible')
                    },
                    errors: ['network', 409],
                },
            ],
            commonTriggerFn,
            commonAssertFn,
            timeout: EXTENDED_TIMEOUT,
        })
    })

    it.skip('load org units layer', () => {
        // !TODO: Handle error
        // E2E - Org Units Layer [e2fjmQMtJ0c]
        const id = 'e2fjmQMtJ0c'

        const commonAssertFn = () => {
            cy.getByDataTest('dhis2-uicore-alertstack', EXTENDED_TIMEOUT)
                .contains('error', EXTENDED_TIMEOUT)
                .should('be.visible')
        }

        cy.visit(`/?id=${id}`)

        assertIntercepts({
            intercepts: [
                {
                    ...getRequest('getOrgUnits_GeoFeatures1'),
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle error
                },
                {
                    ...getRequest('getOrgUnits_GeoFeatures2'),
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errorss
                },
                {
                    ...getRequest('getOrgUnits_OrganisationUnitGroupSet'),
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
                {
                    ...getRequest('getOrgUnits_OrganisationUnitLevels'),
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
            ],
            commonTriggerFn,
            commonAssertFn,
            timeout: EXTENDED_TIMEOUT,
        })
    })

    it('load earth engine layer', () => {
        // !TODO: Revise custom errors
        // E2E - Earth Engine Layer [VebBMVbwxX5]
        const id = 'VebBMVbwxX5'

        const commonAssertFn = ({ error }) => {
            const errorMessage = {
                network: 'An unknown network error occurred',
                409: 'Simulated error with status code 409',
            }

            // !TODO: Display error in layer card

            cy.getByDataTest('dhis2-uicore-alertstack', EXTENDED_TIMEOUT)
                .contains(`Error: ${errorMessage[error]}`, EXTENDED_TIMEOUT)
                .should('be.visible')
        }

        cy.visit(`/?id=${id}`)

        assertIntercepts({
            intercepts: [
                {
                    ...getRequest('getEarthEngine_GeoFeatures1'),
                    errors: ['network', 409],
                },
                {
                    ...getRequest('getEarthEngine_GeoFeatures2'),
                    errors: ['network', 409],
                },
                {
                    ...getRequest('getEarthEngine_Token'),
                    errors: ['network', 409],
                    assertFn: ({ error }) => {
                        const errorMessage = {
                            network: 'An unknown network error occurred',
                            409: 'Simulated error with status code 409',
                        }

                        // !TODO: Display error in layer card

                        cy.getByDataTest(
                            'dhis2-uicore-alertbar',
                            EXTENDED_TIMEOUT
                        )
                            .contains(errorMessage[error], EXTENDED_TIMEOUT)
                            .should('be.visible')
                    },
                },
                {
                    ...getRequest('getEarthEngine_Token'),
                    statusCode: 500,
                    body: {
                        httpStatus: 'Internal Server Error',
                        httpStatusCode: 500,
                        status: 'ERROR',
                        message: 'No value present',
                    },
                    assertFn: () => {
                        cy.getByDataTest(
                            'dhis2-uicore-alertbar',
                            EXTENDED_TIMEOUT
                        )
                            .contains(
                                'This layer requires a Google Earth Engine account. Check the DHIS2 documentation for more information.',
                                EXTENDED_TIMEOUT
                            )
                            .should('be.visible')
                    },
                },
                {
                    ...getRequest('getEarthEngine_Tile'),
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
            ],
            commonTriggerFn,
            commonAssertFn,
            timeout: EXTENDED_TIMEOUT,
        })
    })
})
