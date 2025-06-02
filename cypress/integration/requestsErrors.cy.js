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
            intercepts: [
                {
                    method: 'GET',
                    url: `**/maps/${id}?fields=id%2Cuser%2CdisplayName~rename(name)%2Cdescription%2Clongitude%2Clatitude%2Czoom%2Cbasemap%2Ccreated%2ClastUpdated%2Caccess%2Cupdate%2Cmanage%2Cdelete%2Chref%2C%20mapViews%5B*%2Ccolumns%5Bdimension%2Cfilter%2Citems%5BdimensionItem~rename(id)%2CdimensionItemType%2CdisplayName~rename(name)%5D%5D%2Crows%5Bdimension%2Cfilter%2Citems%5BdimensionItem~rename(id)%2CdimensionItemType%2CdisplayName~rename(name)%5D%5D%2Cfilters%5Bdimension%2Cfilter%2Citems%5BdimensionItem~rename(id)%2CdimensionItemType%2CdisplayName~rename(name)%5D%5D%2CorganisationUnits%5Bid%2Cpath%5D%2CdataDimensionItems%2Cprogram%5Bid%2CdisplayName~rename(name)%5D%2CprogramStage%5Bid%2CdisplayName~rename(name)%5D%2ClegendSet%5Bid%2CdisplayName~rename(name)%5D%2CtrackedEntityType%5Bid%2CdisplayName~rename(name)%5D%2CorganisationUnitSelectionMode%2C!href%2C!publicAccess%2C!rewindRelativePeriods%2C!userOrganisationUnit%2C!userOrganisationUnitChildren%2C!userOrganisationUnitGrandChildren%2C!externalAccess%2C!access%2C!relativePeriods%2C!columnDimensions%2C!rowDimensions%2C!filterDimensions%2C!user%2C!organisationUnitGroups%2C!itemOrganisationUnitGroups%2C!userGroupAccesses%2C!indicators%2C!dataElements%2C!dataElementOperands%2C!dataElementGroups%2C!dataSets%2C!periods%2C!organisationUnitLevels%2C!sortOrder%2C!topLimit%5D`,
                    alias: 'getMaps',
                },
            ],
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
                            method: 'GET',
                            url: '**/geoFeatures?_=xE7jOejl9FI&ou=ou%3APMa2VCrupOd%3BLEVEL-4&displayProperty=NAME',
                            alias: 'getGeoFeatures1',
                            error: 'network',
                        },
                        {
                            method: 'GET',
                            url: '**/geoFeatures?_=xE7jOejl9FI&ou=ou%3APMa2VCrupOd%3BLEVEL-4&displayProperty=NAME&coordinateField=ihn1wb9eho8',
                            alias: 'getGeoFeatures2',
                            error: 'network',
                        },
                    ],
                    alias: 'getGeoFeaturesGroup',
                },
                {
                    intercepts: [
                        {
                            method: 'GET',
                            url: '**/geoFeatures?_=xE7jOejl9FI&ou=ou%3APMa2VCrupOd%3BLEVEL-4&displayProperty=NAME',
                            alias: 'getGeoFeatures1',
                            error: 409,
                        },
                        {
                            method: 'GET',
                            url: '**/geoFeatures?_=xE7jOejl9FI&ou=ou%3APMa2VCrupOd%3BLEVEL-4&displayProperty=NAME&coordinateField=ihn1wb9eho8',
                            alias: 'getGeoFeatures2',
                            error: 409,
                        },
                    ],
                    alias: 'getGeoFeaturesGroup',
                },
                {
                    method: 'GET',
                    url: '**/geoFeatures?_=xE7jOejl9FI&ou=ou%3APMa2VCrupOd%3BLEVEL-4&displayProperty=NAME&coordinateField=ihn1wb9eho8',
                    alias: 'getGeoFeatures2',
                    errors: ['network', 409],
                },
                {
                    method: 'GET',
                    url: '**/analytics.json?dimension=dx:Uvn6LCg7dVU&dimension=ou:LEVEL-4;PMa2VCrupOd&filter=J5jldMd8OHv:EYbopBOJWsW&filter=pe:THIS_YEAR&displayProperty=NAME&skipData=false&skipMeta=true',
                    alias: 'getAnalytics1',
                    errors: [409], // !TODO: Double check network error handling
                },
                {
                    method: 'GET',
                    url: '**/analytics.json?dimension=ou:PMa2VCrupOd;LEVEL-4&dimension=dx:Uvn6LCg7dVU&filter=pe:THIS_YEAR&filter=J5jldMd8OHv:EYbopBOJWsW&displayProperty=NAME&skipMeta=false&skipData=true&includeMetadataDetails=true',
                    alias: 'getAnalytics2',
                    errors: [409], // !TODO: Double check network error handling
                },
                {
                    method: 'GET',
                    url: '**/legendSets/fqs276KXCXi?fields=id,displayName~rename(name),legends%5Bid%2CdisplayName~rename(name)%2CstartValue%2CendValue%2Ccolor%5D&paging=false',
                    alias: 'getLegendSets',
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
                    method: 'GET',
                    url: '**/analytics/events/count/VBqh0ynB2wv.json?dimension=ou:ImspTQPwCqd&dimension=qrur9Dvnyt5:LT:5&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2024-01-01&endDate=2025-10-01&coordinateField=psigeometry',
                    alias: 'getAnalytics1',
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
                    method: 'GET',
                    url: '**/analytics/events/count/VBqh0ynB2wv.json?dimension=ou:ImspTQPwCqd&dimension=qrur9Dvnyt5:LT:5&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2024-01-01&endDate=2025-10-01&coordinateField=psigeometry',
                    alias: 'getAnalytics1',
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
                    method: 'GET',
                    url: '**/analytics/events/cluster/VBqh0ynB2wv.json?dimension=ou:ImspTQPwCqd&dimension=qrur9Dvnyt5:LT:5&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2024-01-01&endDate=2025-10-01&coordinateField=psigeometry&bbox=-14.0625%2C8.407168163601076%2C-11.25%2C11.178401873711785&clusterSize=67265&includeClusterPoints=false',
                    alias: 'getAnalytics2',
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
                {
                    method: 'GET',
                    url: '**/analytics/events/cluster/VBqh0ynB2wv.json?dimension=ou:ImspTQPwCqd&dimension=qrur9Dvnyt5:LT:5&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2024-01-01&endDate=2025-10-01&coordinateField=psigeometry&bbox=-14.0625%2C5.61598581915534%2C-11.25%2C8.407168163601076&clusterSize=67265&includeClusterPoints=false',
                    alias: 'getAnalytics3',
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
                {
                    method: 'GET',
                    url: '**/analytics/events/cluster/VBqh0ynB2wv.json?dimension=ou:ImspTQPwCqd&dimension=qrur9Dvnyt5:LT:5&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2024-01-01&endDate=2025-10-01&coordinateField=psigeometry&bbox=-11.25%2C8.407168163601076%2C-8.4375%2C11.178401873711785&clusterSize=67265&includeClusterPoints=false',
                    alias: 'getAnalytics4',
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
                {
                    method: 'GET',
                    url: '**/analytics/events/cluster/VBqh0ynB2wv.json?dimension=ou:ImspTQPwCqd&dimension=qrur9Dvnyt5:LT:5&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2024-01-01&endDate=2025-10-01&coordinateField=psigeometry&bbox=-11.25%2C5.61598581915534%2C-8.4375%2C8.407168163601076&clusterSize=67265&includeClusterPoints=false',
                    alias: 'getAnalytics5',
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
                {
                    method: 'GET',
                    url: '**/analytics/events/cluster/VBqh0ynB2wv.json?dimension=ou:ImspTQPwCqd&dimension=qrur9Dvnyt5:LT:5&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2024-01-01&endDate=2025-10-01&coordinateField=psigeometry&bbox=-16.875%2C5.61598581915534%2C-14.0625%2C8.407168163601076&clusterSize=67265&includeClusterPoints=false',
                    alias: 'getAnalytics6',
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
                {
                    method: 'GET',
                    url: '**/analytics/events/cluster/VBqh0ynB2wv.json?dimension=ou:ImspTQPwCqd&dimension=qrur9Dvnyt5:LT:5&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2024-01-01&endDate=2025-10-01&coordinateField=psigeometry&bbox=-16.875%2C8.407168163601076%2C-14.0625%2C11.178401873711785&clusterSize=67265&includeClusterPoints=false',
                    alias: 'getAnalytics7',
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
                {
                    method: 'GET',
                    url: '**/programStages/pTo4uMt3xur?fields=programStageDataElements%5BdisplayInReports%2CdataElement%5Bid%2Ccode%2CdisplayName~rename(name)%2CoptionSet%2CvalueType%5D%5D&paging=false',
                    alias: 'getProgramStages',
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
                {
                    method: 'GET',
                    url: '**/optionSets/pC3N9N77UmT?fields=id,displayName~rename(name),options%5Bid%2Ccode%2CdisplayName~rename(name)%5D&paging=false',
                    alias: 'getOptionSets',
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
                {
                    method: 'GET',
                    url: '**/dhis-web-maps/fonts/Open%20Sans%20Bold/0-255.pbf',
                    alias: 'getFonts',
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
                    method: 'GET',
                    url: '**/analytics/events/query/VBqh0ynB2wv.json?dimension=ou:fwxkctgmffZ&dimension=qrur9Dvnyt5:LT:5&dimension=oZg33kd9taw&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2024-01-01&endDate=2025-10-01&coordinateField=F3ogKBuviRA&pageSize=100000',
                    alias: 'getAnalytics1',
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
                    method: 'GET',
                    url: '**/analytics/events/query/VBqh0ynB2wv.json?dimension=ou:fwxkctgmffZ&dimension=qrur9Dvnyt5:LT:5&dimension=oZg33kd9taw&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2024-01-01&endDate=2025-10-01&coordinateField=F3ogKBuviRA&pageSize=100000',
                    alias: 'getAnalytics1',
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
                    method: 'GET',
                    url: '**/programStages/pTo4uMt3xur?fields=programStageDataElements%5BdisplayInReports%2CdataElement%5Bid%2Ccode%2CdisplayName~rename(name)%2CoptionSet%2CvalueType%5D%5D&paging=false',
                    alias: 'getProgramStages',
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
                {
                    method: 'GET',
                    url: '**/optionSets/pC3N9N77UmT?fields=id,displayName~rename(name),options%5Bid%2Ccode%2CdisplayName~rename(name)%5D&paging=false',
                    alias: 'getOptionSets',
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
                {
                    method: 'GET',
                    url: '**/analytics/events/query/VBqh0ynB2wv.json?dimension=ou:fwxkctgmffZ&dimension=qrur9Dvnyt5&dimension=oZg33kd9taw&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2024-01-01&endDate=2025-10-01&coordinateField=F3ogKBuviRA&pageSize=100000',
                    alias: 'getAnalytics2',
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
                    method: 'GET',
                    url: '**/tracker/trackedEntities?skipPaging=true&fields=trackedEntity~rename(id),geometry,relationships&orgUnit=ImspTQPwCqd&ouMode=DESCENDANTS&program=M3xtLkYBlKI&updatedAfter=2000-01-01&updatedBefore=2025-05-19',
                    alias: 'getTrackedEntities1',
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
                {
                    method: 'GET',
                    url: '**/tracker/trackedEntities?skipPaging=true&fields=trackedEntity~rename(id),geometry,relationships&orgUnit=ImspTQPwCqd&ouMode=DESCENDANTS&trackedEntityType=Zy2SEgA61ys',
                    alias: 'getTrackedEntities2',
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
            ]
        } else {
            layerSpecificRequests = [
                {
                    method: 'GET',
                    url: '**/tracker/trackedEntities?paging=false&fields=trackedEntity~rename(id),geometry,relationships&orgUnits=ImspTQPwCqd&orgUnitMode=DESCENDANTS&program=M3xtLkYBlKI&updatedAfter=2000-01-01&updatedBefore=2025-05-19',
                    alias: 'getTrackedEntities1',
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
                {
                    method: 'GET',
                    url: '**/tracker/trackedEntities?paging=false&fields=trackedEntity~rename(id),geometry,relationships&orgUnits=ImspTQPwCqd&orgUnitMode=DESCENDANTS&trackedEntityType=Zy2SEgA61ys',
                    alias: 'getTrackedEntities2',
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
            ]
        }

        assertIntercepts({
            intercepts: [
                ...layerSpecificRequests,
                {
                    method: 'GET',
                    url: '**/relationshipTypes/Mv8R4MPcNcX',
                    alias: 'getRelationshipType',
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
                {
                    method: 'GET',
                    url: '**/trackedEntityTypes/Zy2SEgA61ys?fields=displayName,featureType',
                    alias: 'getTrackedEntityType1',
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors (layer loads)
                },
                {
                    method: 'GET',
                    url: '**/trackedEntityTypes/We9I19a3vO1?fields=trackedEntityTypeAttributes%5BdisplayInList%2CtrackedEntityAttribute%5Bid%2CdisplayName~rename(name)%2CoptionSet%2CvalueType%5D%5D&paging=false',
                    alias: 'getTrackedEntityType2',
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors (layer loads)
                },
                {
                    method: 'GET',
                    url: '**/programs/M3xtLkYBlKI?fields=programTrackedEntityAttributes%5BdisplayInList%2CtrackedEntityAttribute%5Bid%2CdisplayName~rename(name)%2CoptionSet%2CvalueType%5D%5D&paging=false',
                    alias: 'getProgram',
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors (layer loads)
                },
            ],
            commonTriggerFn,
            commonAssertFn,
            perInterceptTrigger: true,
        })
    })

    it('load facilities layer', () => {
        // E2E - Facilities Layer [kIAUN3dInEz]
        const id = 'kIAUN3dInEz'

        cy.visit(`#/${id}`)

        assertIntercepts({
            intercepts: [
                {
                    method: 'GET',
                    url: '**/geoFeatures?_=xE7jOejl9FI&includeGroupSets=true&ou=ou%3AVth0fbpFcsO%3BLEVEL-4&displayProperty=NAME',
                    alias: 'getGeoFeatures',
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
                    method: 'GET',
                    url: '**/organisationUnitGroupSets/J5jldMd8OHv?fields=organisationUnitGroups%5Bid%2Cname%2Ccolor%2Csymbol%5D',
                    alias: 'getOrganisationUnitGroupSets',
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
                {
                    method: 'GET',
                    url: /images\/orgunitgroup\/\d+\.png/,
                    alias: 'getOUGSImage',
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
                            method: 'GET',
                            url: '**/geoFeatures?_=xE7jOejl9FI&includeGroupSets=true&ou=ou%3Aat6UHUQatSo%3BLEVEL-4&displayProperty=NAME',
                            alias: 'getGeoFeatures1',
                            error: 'network',
                        },
                        {
                            method: 'GET',
                            url: '**/geoFeatures?_=xE7jOejl9FI&coordinateField=ihn1wb9eho8&includeGroupSets=true&ou=ou%3Aat6UHUQatSo%3BLEVEL-4&displayProperty=NAME',
                            alias: 'getGeoFeatures2',
                            error: 'network',
                        },
                    ],
                    alias: 'getGeoFeaturesGroup',
                    skip: true, // !TODO: Handle error
                },
                {
                    intercepts: [
                        {
                            method: 'GET',
                            url: '**/geoFeatures?_=xE7jOejl9FI&includeGroupSets=true&ou=ou%3Aat6UHUQatSo%3BLEVEL-4&displayProperty=NAME',
                            alias: 'getGeoFeatures1',
                            error: 409,
                        },
                        {
                            method: 'GET',
                            url: '**/geoFeatures?_=xE7jOejl9FI&coordinateField=ihn1wb9eho8&includeGroupSets=true&ou=ou%3Aat6UHUQatSo%3BLEVEL-4&displayProperty=NAME',
                            alias: 'getGeoFeatures2',
                            error: 409,
                        },
                    ],
                    alias: 'getGeoFeaturesGroup',
                    skip: true, // !TODO: Handle error
                },
                {
                    method: 'GET',
                    url: '**/geoFeatures?_=xE7jOejl9FI&coordinateField=ihn1wb9eho8&includeGroupSets=true&ou=ou%3Aat6UHUQatSo%3BLEVEL-4&displayProperty=NAME',
                    alias: 'getGeoFeatures2',
                    error: ['network', 409],
                    skip: true, // !TODO: Handle errorss
                },
                {
                    method: 'GET',
                    url: '**/organisationUnitGroupSets/J5jldMd8OHv?fields=organisationUnitGroups%5Bid%2Cname%2Ccolor%2Csymbol%5D',
                    alias: 'getOrganisationUnitGroupSet',
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
                {
                    method: 'GET',
                    url: '**/organisationUnitLevels?fields=id%2Clevel%2CdisplayName~rename(name)&paging=false',
                    alias: 'getOrganisationUnitLevels2',
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
                    method: 'GET',
                    url: '**/geoFeatures?_=xE7jOejl9FI&ou=ou%3AbL4ooGhyHRQ%3BLEVEL-4&displayProperty=NAME',
                    alias: 'getGeoFeatures1',
                    errors: ['network', 409],
                },
                {
                    method: 'GET',
                    url: '**/geoFeatures?_=xE7jOejl9FI&ou=ou%3AbL4ooGhyHRQ%3BLEVEL-4&displayProperty=NAME&coordinateField=ihn1wb9eho8',
                    alias: 'getGeoFeatures2',
                    errors: ['network', 409],
                },
                {
                    method: 'GET',
                    url: '**/tokens/google',
                    alias: 'getTokens',
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
                    method: 'GET',
                    url: '**/tokens/google',
                    alias: 'getToken',
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
                    method: 'GET',
                    url: /earthengine-legacy\/maps\/[^/]+\/tiles\/\d+\/\d+\/\d+/,
                    alias: 'getGEETile',
                    errors: ['network', 409],
                    skip: true, // !TODO: Handle errors
                },
            ],
            commonTriggerFn,
            commonAssertFn,
        })
    })
})
