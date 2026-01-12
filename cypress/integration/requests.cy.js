import { getRequests } from '../support/requests.js'
import {
    assertIntercepts,
    EXTENDED_TIMEOUT,
    getDhis2Version,
} from '../support/util.js'

const commonRequests = getRequests([
    // -- @dhis2/app-service-data
    // -- DataEngine.js
    'getAppServiceData_Me',
    'getAppServiceData_UserSettings',
    // -- ServerVersionProvider.js
    'getAppServiceData_SystemInfo',
    // --

    // -- @dhis2/ui
    // -- components/header-bar/src/header-bar.js
    'getHeaderBar_SystemSettings1',
    'getHeaderBar_SystemSettings2',
    'getHeaderBar_Me1',
    'getHeaderBar_Me2',
    'getHeaderBar_DhisWebCommons',
    // components/header-bar/src/logo-image.js
    'getHeaderBar_StaticContent',
    // --

    // -- DataStoreProvider - src/AppWrapper.js
    // -- @dhis2/app-service-datastore - src/stores/DataStore.ts
    'getDataStoreProvider_DataStore1',
    'getDataStoreProvider_DataStore2',
    'getDataStoreProvider_UserDataStore1',
    'getDataStoreProvider_UserDataStore2',
    // --

    // -- CachedDataProvider - src/AppWrapper.js
    // -- @dhis2/analytics - src/components/CachedDataProvider.js
    'getCachedDataProvider_Me',
    'getCachedDataProvider_SystemSettings',
    'getCachedDataProvider_ExternalMapLayers',
    'getCachedDataProvider_SystemInfo',
    // --

    // -- OrgUnitsProvider - src/AppWrapper.js
    // -- engine.query
    'getOrgUnitsProvider_OrganisationUnits',
    'getOrgUnitsProvider_OrganisationUnitLevels',
    // --

    // -- useLoadDataStore - src/components/app/useLoadDataStore.js
    // -- engine.query
    'getLoadDataStore_DataStore1',
    'getLoadDataStore_DataStore2',
    // --

    // -- useLoadMap - src/components/app/useLoadMap.js
    // -- @dhis2/maps-gl - src/layers/TileLayer.js
    // Dropping this intercept because MapLibre v5 loads raster tiles via <img> instead of XHR/fetch
    // 'getLoadMap_BasemapTile',
    // --
])

const idDependentRequests = (id) =>
    getRequests(
        [
            // -- useLoadMap - src/components/app/useLoadMap.js
            // -- engine.query (w/ fetchMap)
            'getMap',
            // -- engine.query
            'postDataStatistics',
            // --
        ],
        id
    )

describe('API requests check for all layer types', () => {
    it('load thematic layer', () => {
        // E2E - Thematic Layer [tFVpGPWj7MJ]
        const id = 'tFVpGPWj7MJ'
        assertIntercepts({
            intercepts: [
                {
                    intercepts: [
                        ...commonRequests,
                        ...idDependentRequests(id),
                        ...getRequests([
                            // -- thematicLoader - src/loaders/thematicLoader.js
                            // -- @dhis2/d2 - src/analytics/Analytics.js
                            'getThematic_Analytics1',
                            'getThematic_Analytics2',
                            // -- @dhis2/d2 - src/geofeatures/GeoFeatures.js
                            'getThematic_GeoFeatures1',
                            'getThematic_GeoFeatures2',
                            // -- engine.query
                            'getThematic_LegendSets',
                            // --
                        ]),
                    ],
                },
            ],
            commonTriggerFn: () => {
                cy.visit(`#/${id}`)
            },
        })
    })

    it('load events layer w/ server cluster', () => {
        // E2E - Events Layer - Server Cluster [VzwBJhyad9P]
        const id = 'VzwBJhyad9P'
        assertIntercepts({
            intercepts: [
                {
                    intercepts: [
                        ...commonRequests,
                        ...idDependentRequests(id),
                        ...getRequests([
                            // -- eventLoader - src/loaders/eventLoader.js
                            // -- @dhis2/d2 - src/analytics/Analytics.js
                            'getEventsCluster_Analytics1',
                            'getEventsCluster_Analytics2',
                            'getEventsCluster_Analytics3',
                            'getEventsCluster_Analytics4',
                            'getEventsCluster_Analytics5',
                            'getEventsCluster_Analytics6',
                            'getEventsCluster_Analytics7',
                            // -- engine.query (w/ loadEventCoordinateFieldName)
                            'getEventsCluster_ProgramStages',
                            // -- engine.query
                            'getEventsCluster_OptionSets',
                            // --

                            // -- @dhis2/maps-gl - src/layers/ServerCluster.js
                            'getEventsCluster_Fonts',
                            // --
                        ]),
                    ],
                },
            ],
            commonTriggerFn: () => {
                cy.visit(`#/${id}`)
            },
        })
    })

    it('load events layer w/ coordinate field & data download', () => {
        // E2E - Events Layer - Coordinate Field [ugVIdvX2qIG]
        const id = 'ugVIdvX2qIG'
        assertIntercepts({
            intercepts: [
                {
                    intercepts: [
                        ...commonRequests,
                        ...idDependentRequests(id),
                        ...getRequests([
                            // -- eventLoader - src/loaders/eventLoader.js
                            // -- @dhis2/d2 - src/analytics/Analytics.js
                            'getEventsStandard_Analytics1',
                            // -- engine.query (w/ loadEventCoordinateFieldName)
                            'getEventsStandard_ProgramStages',
                            // -- engine.query
                            'getEventsStandard_OptionSets',
                            // --

                            // -- src/components/layers/download/DataDownloadDialog.js
                            // -- @dhis2/d2 - src/analytics/Analytics.js
                            // TODO: Why filter is not applied?
                            'getEventsStandard_Analytics2',
                            // --
                        ]),
                    ],
                },
            ],
            commonTriggerFn: () => {
                cy.visit(`#/${id}`, EXTENDED_TIMEOUT)
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
        })
    })

    it('load tracked entities layer', () => {
        // E2E - Tracked Entities Layer [VuYJ5LIgQo2]
        const id = 'VuYJ5LIgQo2'

        const serverVersion = getDhis2Version()
        let versionSpecificRequests
        if (serverVersion.minor === '40') {
            versionSpecificRequests = getRequests([
                // -- trackedEntityLoader - src/loaders/trackedEntityLoader.js
                // -- apiFetch - src/util/api.js
                // -- @dhis2/d2 - src/api/Api.js
                'getTrackedEntities40_TrackedEntities1',
                // -- teiRelationshipsParser - src/util/teiRelationshipsParser.js
                // -- apiFetch - src/util/api.js
                // -- @dhis2/d2 - src/api/Api.js
                // TODO: Should this be only TEIs within the same timeframe?
                'getTrackedEntities40_TrackedEntities2',
                // --
            ])
        } else {
            versionSpecificRequests = getRequests([
                // -- trackedEntityLoader - src/loaders/trackedEntityLoader.js
                // -- apiFetch - src/util/api.js
                // -- @dhis2/d2 - src/api/Api.js
                'getTrackedEntities41_TrackedEntities1',
                // -- teiRelationshipsParser - src/util/teiRelationshipsParser.js
                // -- apiFetch - src/util/api.js
                // -- @dhis2/d2 - src/api/Api.js
                // TODO: Should this be only TEIs within the same timeframe?
                'getTrackedEntities41_TrackedEntities2',
                // --
            ])
        }

        assertIntercepts({
            intercepts: [
                {
                    intercepts: [
                        ...commonRequests,
                        ...idDependentRequests(id),
                        ...versionSpecificRequests,
                        ...getRequests([
                            // -- trackedEntityLoader - src/loaders/trackedEntityLoader.js
                            // -- apiFetch - src/util/api.js
                            // -- @dhis2/d2 - src/api/Api.js
                            'getTrackedEntities_RelationshipType',
                            'getTrackedEntities_TrackedEntityType1',
                            // --

                            // -- TrackedEntityLayer - src/components/map/layers/TrackedEntityLayer.js
                            // -- engine.query (/w loadDisplayAttributes)
                            'getTrackedEntities_TrackedEntityType2',
                            'getTrackedEntities_Program',
                            // --
                        ]),
                    ],
                },
            ],
            commonTriggerFn: () => {
                cy.visit(`#/${id}`)
            },
        })
    })

    it('load facilities layer', () => {
        // E2E - Facilities Layer [kIAUN3dInEz]
        const id = 'kIAUN3dInEz'
        assertIntercepts({
            intercepts: [
                {
                    intercepts: [
                        ...commonRequests,
                        ...idDependentRequests(id),
                        ...getRequests([
                            // -- facilityLoader - src/loaders/facilityLoader.js
                            // -- @dhis2/d2 - src/geofeatures/GeoFeatures.js
                            'getFacilities_GeoFeatures',
                            // --  engine.query
                            'getFacilities_OrganisationUnitGroupSets',
                            // --

                            // -- @dhis2/maps-gl - src/layers/Markers.js
                            'getFacilities_OUGSImage',
                            // --
                        ]),
                    ],
                },
            ],
            commonTriggerFn: () => {
                cy.visit(`#/${id}`)
            },
        })
    })

    it('load org units layer', () => {
        // E2E - Org Units Layer [e2fjmQMtJ0c]
        const id = 'e2fjmQMtJ0c'
        assertIntercepts({
            intercepts: [
                {
                    intercepts: [
                        ...commonRequests,
                        ...idDependentRequests(id),
                        ...getRequests([
                            // -- orgUnitLoader - src/loaders/orgUnitLoader.js
                            // -- @dhis2/d2 - src/analytics/Analytics.js
                            'getOrgUnits_GeoFeatures1',
                            'getOrgUnits_GeoFeatures2',
                            // -- engine.query
                            'getOrgUnits_OrganisationUnitGroupSet',
                            'getOrgUnits_OrganisationUnitLevels',
                            // --
                        ]),
                    ],
                },
            ],
            commonTriggerFn: () => {
                cy.visit(`#/${id}`)
            },
        })
    })

    it.skip('load earth engine layer', () => {
        // TODO: E2E DB fix
        // E2E - Earth Engine Layer [VebBMVbwxX5]
        const id = 'VebBMVbwxX5'
        assertIntercepts({
            intercepts: [
                {
                    intercepts: [
                        ...commonRequests,
                        ...idDependentRequests(id),
                        ...getRequests([
                            // -- earthEngineLoader - src/loaders/earthEngineLoader.js
                            // -- @dhis2/d2 - src/analytics/Analytics.js
                            'getEarthEngine_GeoFeatures1',
                            'getEarthEngine_GeoFeatures2',
                            // --

                            // -- EarthEngineLayer - src/components/map/layers/earthEngine/EarthEngineLayer.js
                            // -- getAuthToken - src/util/earthEngine.js
                            // -- apiFetch - src/util/api.js
                            // -- @dhis2/d2 - src/api/Api.js
                            'getEarthEngine_Token',
                            // --

                            // -- @dhis2/maps-gl - src/layers/EarthEngine.js
                            'getEarthEngine_Tile',
                            // --
                        ]),
                    ],
                },
            ],
            commonTriggerFn: () => {
                cy.visit(`#/${id}`)
            },
        })
    })

    // Test layer cannot be added to E2E DB (base version is 2.38 and GeoJSON layers were introduced later)
    it.skip('load geojson layer', () => {
        // E2E - GeoJSON Layer [gmtrb6NVsDP]
        const id = 'gmtrb6NVsDP'
        assertIntercepts({
            intercepts: [
                {
                    intercepts: [
                        ...commonRequests,
                        ...idDependentRequests(id),
                        ...getRequests([
                            // -- geoJsonUrlLoader - src/loaders/geoJsonUrlLoader.js
                            // -- engine.query
                            'getGeoJson_getExternalMapLayer1',
                            'getGeoJson_getExternalMapLayer2',
                            // --
                        ]),
                    ],
                },
            ],
            commonTriggerFn: () => {
                cy.visit(`#/${id}`)
            },
        })
    })
})
