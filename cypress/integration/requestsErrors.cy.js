import { getRequest } from '../support/requests.js'
import {
    assertIntercepts,
    EXTENDED_TIMEOUT,
    getDhis2Version,
} from '../support/util.js'

const commonTriggerFn = () => {
    cy.reload(true)
}

describe('Error handling check for all layer types', () => {
    it.skip('missing map', () => {
        // !TODO: Handle error
        const id = '00000000000'
        assertIntercepts({
            intercepts: [getRequest('getMap', id)],
            triggerFn: () => {
                cy.visit(`#/${id}`)
            },
        })
    })

    it('load thematic layer', () => {
        // Caching mechanisms makes testing independant failures of
        // getGeoFeatures1 & getGeoFeatures2 difficult
        // E2E - Thematic Layer [tFVpGPWj7MJ]
        const id = 'tFVpGPWj7MJ'

        const commonAssertFn = () => {
            cy.getByDataTest('dhis2-uicore-noticebox', EXTENDED_TIMEOUT)
                .contains('Failed to load layer')
                .should('be.visible')

            cy.getByDataTest('dhis2-uicore-alertstack', EXTENDED_TIMEOUT)
                .contains('Error')
                .should('be.visible')
        }

        cy.visit(`#/${id}`)

        assertIntercepts({
            intercepts: [
                {
                    intercepts: [
                        {
                            ...getRequest('getThematic_GeoFeatures1'),
                            error: 'network',
                        },
                        {
                            ...getRequest('getThematic_GeoFeatures2'),
                            error: 'network',
                        },
                    ],
                    alias: 'getGeoFeaturesGroup',
                },
                {
                    intercepts: [
                        {
                            ...getRequest('getThematic_GeoFeatures1'),
                            error: 409,
                        },
                        {
                            ...getRequest('getThematic_GeoFeatures2'),
                            error: 409,
                        },
                    ],
                    alias: 'getGeoFeaturesGroup',
                },
                {
                    ...getRequest('getThematic_GeoFeatures2'),
                    errors: ['network', 409],
                },
                {
                    ...getRequest('getThematic_Analytics1'),
                    errors: [409], // !TODO: Double check network error handling
                },
                {
                    ...getRequest('getThematic_Analytics2'),
                    alias: 'getAnalytics2',
                    errors: [409], // !TODO: Double check network error handling
                },
                {
                    ...getRequest('getThematic_LegendSets'),
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
            ],
            commonTriggerFn,
            commonAssertFn,
        })
    })

    it('load events layer w/ server cluster', () => {
        // E2E - Events Layer - Server Cluster [VzwBJhyad9P]
        const id = 'VzwBJhyad9P'

        cy.visit(`#/${id}`)

        assertIntercepts({
            intercepts: [
                {
                    ...getRequest('getEventsCluster_Analytics1'),
                    errors: ['network'],
                    assertFn: () => {
                        cy.getByDataTest(
                            'dhis2-uicore-alertstack',
                            EXTENDED_TIMEOUT
                        )
                            .contains('error')
                            .should('be.visible')
                    },
                },
                {
                    ...getRequest('getEventsCluster_Analytics1'),
                    errors: [409],
                    assertFn: () => {
                        cy.getByDataTest(
                            'dhis2-uicore-alertstack',
                            EXTENDED_TIMEOUT
                        )
                            .contains(
                                "You don't have access to this layer data"
                            )
                            .should('be.visible')
                    },
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
            perInterceptTrigger: true,
        })
    })

    it('load events layer w/ coordinate field & data download', () => {
        // E2E - Events Layer - Coordinate Field [ugVIdvX2qIG]
        const id = 'ugVIdvX2qIG'

        cy.visit(`#/${id}`)

        assertIntercepts({
            intercepts: [
                {
                    ...getRequest('getEventsStandard_Analytics1'),
                    triggerFn: () => {
                        cy.reload(true)
                        cy.wait(10000) // eslint-disable-line cypress/no-unnecessary-waiting
                    },
                    errors: ['network'],
                    assertFn: () => {
                        cy.getByDataTest(
                            'dhis2-uicore-alertstack',
                            EXTENDED_TIMEOUT
                        )
                            .contains('error')
                            .should('be.visible')
                    },
                },
                {
                    ...getRequest('getEventsStandard_Analytics1'),
                    triggerFn: () => {
                        cy.reload(true)
                        cy.wait(10000) // eslint-disable-line cypress/no-unnecessary-waiting
                    },
                    errors: [409],
                    assertFn: () => {
                        cy.getByDataTest(
                            'dhis2-uicore-alertstack',
                            EXTENDED_TIMEOUT
                        )
                            .contains(
                                "You don't have access to this layer data"
                            )
                            .should('be.visible')
                    },
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
                        cy.reload(true)
                        cy.getByDataTest('layercard')
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
                            .contains('Data download failed.')
                            .should('be.visible')
                    },
                    errors: ['network', 409],
                },
            ],
            commonTriggerFn,
            perInterceptTrigger: true,
        })
    })

    it.skip('load tracked entities layer', () => {
        // !TODO: Handle errors
        // E2E - Tracked Entities Layer [VuYJ5LIgQo2]
        const id = 'VuYJ5LIgQo2'

        const commonAssertFn = () => {
            cy.getByDataTest('dhis2-uicore-alertstack', EXTENDED_TIMEOUT)
                .contains('error')
                .should('be.visible')
        }

        cy.visit(`#/${id}`)

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
        })
    })

    it('load facilities layer', () => {
        // E2E - Facilities Layer [kIAUN3dInEz]
        const id = 'kIAUN3dInEz'

        cy.visit(`#/${id}`)

        assertIntercepts({
            intercepts: [
                {
                    ...getRequest('getFacilities_GeoFeatures'),
                    errors: ['network', 409],
                    assertFn: () => {
                        cy.getByDataTest(
                            'dhis2-uicore-alertstack',
                            EXTENDED_TIMEOUT
                        )
                            .contains('Error')
                            .should('be.visible')
                        cy.getByDataTest(
                            'dhis2-uicore-alertstack',
                            EXTENDED_TIMEOUT
                        )
                            .contains(
                                'No coordinates found for selected facilities'
                            )
                            .should('be.visible')
                    },
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
                            .contains('Symbol not found')
                            .should('be.visible')
                    },
                    errors: ['network', 409],
                },
            ],
            commonTriggerFn,
        })
    })

    it.skip('load org units layer', () => {
        // !TODO: Handle error
        // E2E - Org Units Layer [e2fjmQMtJ0c]
        const id = 'e2fjmQMtJ0c'

        const commonAssertFn = () => {
            cy.getByDataTest('dhis2-uicore-alertstack', EXTENDED_TIMEOUT)
                .contains('error')
                .should('be.visible')
        }

        cy.visit(`#/${id}`)

        assertIntercepts({
            intercepts: [
                {
                    intercepts: [
                        {
                            ...getRequest('getOrgUnits_GeoFeatures1'),
                            error: 'network',
                        },
                        {
                            ...getRequest('getOrgUnits_GeoFeatures2'),
                            error: 'network',
                        },
                    ],
                    alias: 'getGeoFeaturesGroup',
                    skip: true, // !TODO: Handle error
                },
                {
                    intercepts: [
                        {
                            ...getRequest('getOrgUnits_GeoFeatures1'),
                            error: 409,
                        },
                        {
                            ...getRequest('getOrgUnits_GeoFeatures2'),
                            error: 409,
                        },
                    ],
                    alias: 'getGeoFeaturesGroup',
                    skip: true, // !TODO: Handle error
                },
                {
                    ...getRequest('getOrgUnits_GeoFeatures2'),
                    error: ['network', 409],
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
        })
    })

    it('load earth engine layer', () => {
        // E2E - Earth Engine Layer [VebBMVbwxX5]
        const id = 'VebBMVbwxX5'

        const commonAssertFn = () => {
            cy.getByDataTest('dhis2-uicore-alertstack', EXTENDED_TIMEOUT)
                .contains('Error')
                .should('be.visible')
        }

        cy.visit(`#/${id}`)

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
                    errors: ['network'],
                    assertFn: () => {
                        cy.getByDataTest(
                            'dhis2-uicore-alertbar',
                            EXTENDED_TIMEOUT
                        )
                            .contains(
                                'Request is missing required authentication credential.'
                            )
                            .should('be.visible')
                    },
                },
                {
                    ...getRequest('getEarthEngine_Token'),
                    errors: [409],
                    assertFn: () => {
                        cy.getByDataTest(
                            'dhis2-uicore-alertbar',
                            EXTENDED_TIMEOUT
                        )
                            .contains(
                                'This layer requires a Google Earth Engine account. '
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
        })
    })
})
