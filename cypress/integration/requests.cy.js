import {
    assertMultipleInterceptedRequests,
    EXTENDED_TIMEOUT,
    getDhis2Version,
} from '../support/util.js'

const commonRequests = [
    // -- @dhis2/app-adapter - adapter/src/utils/useVerifyLatestUser.js
    { method: 'GET', url: '**/me?fields=id', alias: 'getMe1' },
    // --

    // -- @dhis2/ui - components/header-bar/src/header-bar.js
    {
        method: 'GET',
        url: '**/systemSettings/applicationTitle',
        alias: 'getSystemSettings1',
    },
    {
        method: 'GET',
        url: '**/systemSettings/helpPageLink',
        alias: 'getSystemSettings2',
    },
    {
        method: 'GET',
        url: '**/me?fields=authorities,avatar,email,name,settings',
        alias: 'getMe3',
    },
    {
        method: 'GET',
        url: '**/dhis-web-commons/menu/getModules.action',
        alias: 'getDhisWebCommons',
    },
    { method: 'GET', url: '**/me/dashboard', alias: 'getMe2' },
    // --

    // -- @dhis2/ui - components/header-bar/src/logo-image.js
    {
        method: 'GET',
        url: '**/staticContent/logo_banner',
        alias: 'getStaticContent',
    },
    // --

    // -- DataStoreProvider - src/AppWrapper.js
    // -- @dhis2/app-service-datastore - src/stores/DataStore.ts
    {
        method: 'GET',
        url: '**/dataStore/analytics/settings',
        alias: 'getDataStore1',
    },
    {
        method: 'GET',
        url: '**/userDataStore/analytics/settings',
        alias: 'getUserDataStore1',
    },
    {
        method: 'GET',
        url: '**/userDataStore/analytics/savedObjects',
        alias: 'getUserDataStore2',
    },
    {
        method: 'GET',
        url: '**/dataStore/analytics/savedObjects',
        alias: 'getDataStore2',
    },
    // --

    // -- D2Shim - src/AppWrapper.js
    // -- @dhis2/app-runtime-adapter-d2 - src/useD2.js
    // -- @dhis2/d2 - src/d2.js
    {
        method: 'GET',
        url: '**/me?fields=%3Aall%2CorganisationUnits%5Bid%5D%2CuserGroups%5Bid%5D%2CuserCredentials%5B%3Aall%2C!user%2CuserRoles%5Bid%5D',
        alias: 'getMe4',
    },
    { method: 'GET', url: '**/me/authorization', alias: 'getAuthorization' },
    { method: 'GET', url: '**/userSettings', alias: 'getUserSettings' },
    { method: 'GET', url: '**/system/info', alias: 'getSystemInfo1' },
    { method: 'GET', url: '**/apps', alias: 'getApps' },
    // --

    // -- CachedDataQueryProvider - src/AppWrapper.js
    // -- @dhis2/analytics - src/components/CachedDataQueryProvider.js
    {
        method: 'GET',
        url: '**/me?fields=id%2Cusername%2CdisplayName~rename(name)%2Cauthorities%2Csettings%5BkeyAnalysisDisplayProperty%2CkeyUiLocale%5D',
        alias: 'getMe5',
    },
    {
        method: 'GET',
        url: '**/systemSettings?key=keyAnalysisRelativePeriod,keyBingMapsApiKey,keyHideDailyPeriods,keyHideWeeklyPeriods,keyHideBiWeeklyPeriods,keyHideMonthlyPeriods,keyHideBiMonthlyPeriods,keyDefaultBaseMap',
        alias: 'getSystemSettings3',
    },
    {
        method: 'GET',
        url: '**/externalMapLayers?fields=id%2CdisplayName~rename(name)%2Cservice%2Curl%2Cattribution%2CmapService%2Clayers%2CimageFormat%2CmapLayerPosition%2ClegendSet%2ClegendSetUrl&paging=false',
        alias: 'getExternalMapLayersexternalMapLayers',
    },
    {
        method: 'GET',
        url: '**/system/info?fields=calendar%2CdateFormat',
        alias: 'getSystemInfo2',
    },
    // --

    // -- OrgUnitsProvider - src/AppWrapper.js
    // -- engine.query
    {
        method: 'GET',
        url: '**/organisationUnits?fields=id,displayName~rename(name),path&userDataViewFallback=true',
        alias: 'getOrganisationUnits',
    },
    {
        method: 'GET',
        url: '**/organisationUnitLevels?fields=id,displayName~rename(name),level&order=level%3Aasc&paging=false',
        alias: 'getOrganisationUnitLevels',
    },
    // --

    // -- useLoadDataStore - src/components/app/useLoadDataStore.js
    // -- engine.query
    { method: 'GET', url: '**/dataStore', alias: 'getDataStore3' },
    {
        method: 'GET',
        url: '**/dataStore/DHIS2_MAPS_APP_CORE/MANAGED_LAYER_SOURCES',
        alias: 'getDataStore4',
    },
    // --

    // -- useLoadMap - src/components/app/useLoadMap.js
    // -- @dhis2/maps-gl - src/layers/TileLayer.js
    {
        method: 'GET',
        url: /cartodb-basemaps-[abc]\.global\.ssl\.fastly\.net\/light_all\/\d+\/\d+\/\d+\.png/,
        alias: 'getBasemapTile',
    },
    // --
]
const idDependentRequests = (id) => [
    // -- useLoadMap - src/components/app/useLoadMap.js
    // -- engine.query (w/ fetchMap)
    {
        method: 'GET',
        url: `**/maps/${id}?fields=id%2Cuser%2CdisplayName~rename(name)%2Cdescription%2Clongitude%2Clatitude%2Czoom%2Cbasemap%2Ccreated%2ClastUpdated%2Caccess%2Cupdate%2Cmanage%2Cdelete%2Chref%2C%20mapViews%5B*%2Ccolumns%5Bdimension%2Cfilter%2Citems%5BdimensionItem~rename(id)%2CdimensionItemType%2CdisplayName~rename(name)%5D%5D%2Crows%5Bdimension%2Cfilter%2Citems%5BdimensionItem~rename(id)%2CdimensionItemType%2CdisplayName~rename(name)%5D%5D%2Cfilters%5Bdimension%2Cfilter%2Citems%5BdimensionItem~rename(id)%2CdimensionItemType%2CdisplayName~rename(name)%5D%5D%2CorganisationUnits%5Bid%2Cpath%5D%2CdataDimensionItems%2Cprogram%5Bid%2CdisplayName~rename(name)%5D%2CprogramStage%5Bid%2CdisplayName~rename(name)%5D%2ClegendSet%5Bid%2CdisplayName~rename(name)%5D%2CtrackedEntityType%5Bid%2CdisplayName~rename(name)%5D%2CorganisationUnitSelectionMode%2C!href%2C!publicAccess%2C!rewindRelativePeriods%2C!userOrganisationUnit%2C!userOrganisationUnitChildren%2C!userOrganisationUnitGrandChildren%2C!externalAccess%2C!access%2C!relativePeriods%2C!columnDimensions%2C!rowDimensions%2C!filterDimensions%2C!user%2C!organisationUnitGroups%2C!itemOrganisationUnitGroups%2C!userGroupAccesses%2C!indicators%2C!dataElements%2C!dataElementOperands%2C!dataElementGroups%2C!dataSets%2C!periods%2C!organisationUnitLevels%2C!sortOrder%2C!topLimit%5D`,
        alias: 'getMaps',
    },
    // -- engine.query
    {
        method: 'POST',
        url: `**/dataStatistics?favorite=${id}&eventType=MAP_VIEW`,
        alias: 'postDataStatistics',
    },
    // --
]

describe('API requests check for all layer types', () => {
    it('load thematic layer', () => {
        // E2E - Thematic Layer [tFVpGPWj7MJ]
        const id = 'tFVpGPWj7MJ'
        assertMultipleInterceptedRequests(
            [
                ...commonRequests,
                ...idDependentRequests(id),

                // -- thematicLoader - src/loaders/thematicLoader.js
                // -- @dhis2/d2 - src/analytics/Analytics.js
                {
                    method: 'GET',
                    url: '**/analytics.json?dimension=dx:Uvn6LCg7dVU&dimension=ou:LEVEL-4;PMa2VCrupOd&filter=J5jldMd8OHv:EYbopBOJWsW&filter=pe:THIS_YEAR&displayProperty=NAME&skipData=false&skipMeta=true',
                    alias: 'getAnalytics1',
                },
                {
                    method: 'GET',
                    url: '**/analytics.json?dimension=ou:PMa2VCrupOd;LEVEL-4&dimension=dx:Uvn6LCg7dVU&filter=pe:THIS_YEAR&filter=J5jldMd8OHv:EYbopBOJWsW&displayProperty=NAME&skipMeta=false&skipData=true&includeMetadataDetails=true',
                    alias: 'getAnalytics2',
                },
                // -- @dhis2/d2 - src/geofeatures/GeoFeatures.js
                {
                    method: 'GET',
                    url: '**/geoFeatures?_=xE7jOejl9FI&ou=ou%3APMa2VCrupOd%3BLEVEL-4&displayProperty=NAME',
                    alias: 'getGeoFeatures1',
                },
                {
                    method: 'GET',
                    url: '**/geoFeatures?_=xE7jOejl9FI&ou=ou%3APMa2VCrupOd%3BLEVEL-4&displayProperty=NAME&coordinateField=ihn1wb9eho8',
                    alias: 'getGeoFeatures2',
                },
                // -- engine.query
                {
                    method: 'GET',
                    url: '**/legendSets/fqs276KXCXi?fields=id,displayName~rename(name),legends%5Bid%2CdisplayName~rename(name)%2CstartValue%2CendValue%2Ccolor%5D&paging=false',
                    alias: 'getLegendSets',
                },
                // --
            ],
            () => {
                cy.visit(`#/${id}`)
            }
        )
    })

    it('load events layer w/ server cluster', () => {
        // E2E - Events Layer - Server Cluster [VzwBJhyad9P]
        const id = 'VzwBJhyad9P'
        assertMultipleInterceptedRequests(
            [
                ...commonRequests,
                ...idDependentRequests(id),

                // -- eventLoader - src/loaders/eventLoader.js
                // -- @dhis2/d2 - src/analytics/Analytics.js
                {
                    method: 'GET',
                    url: '**/analytics/events/count/VBqh0ynB2wv.json?dimension=ou:ImspTQPwCqd&dimension=qrur9Dvnyt5:LT:5&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2024-01-01&endDate=2025-10-01&coordinateField=psigeometry',
                    alias: 'getAnalytics1',
                },
                {
                    method: 'GET',
                    url: '**/analytics/events/cluster/VBqh0ynB2wv.json?dimension=ou:ImspTQPwCqd&dimension=qrur9Dvnyt5:LT:5&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2024-01-01&endDate=2025-10-01&coordinateField=psigeometry&bbox=-14.0625%2C8.407168163601076%2C-11.25%2C11.178401873711785&clusterSize=67265&includeClusterPoints=false',
                    alias: 'getAnalytics2',
                },
                {
                    method: 'GET',
                    url: '**/analytics/events/cluster/VBqh0ynB2wv.json?dimension=ou:ImspTQPwCqd&dimension=qrur9Dvnyt5:LT:5&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2024-01-01&endDate=2025-10-01&coordinateField=psigeometry&bbox=-14.0625%2C5.61598581915534%2C-11.25%2C8.407168163601076&clusterSize=67265&includeClusterPoints=false',
                    alias: 'getAnalytics3',
                },
                {
                    method: 'GET',
                    url: '**/analytics/events/cluster/VBqh0ynB2wv.json?dimension=ou:ImspTQPwCqd&dimension=qrur9Dvnyt5:LT:5&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2024-01-01&endDate=2025-10-01&coordinateField=psigeometry&bbox=-11.25%2C8.407168163601076%2C-8.4375%2C11.178401873711785&clusterSize=67265&includeClusterPoints=false',
                    alias: 'getAnalytics4',
                },
                {
                    method: 'GET',
                    url: '**/analytics/events/cluster/VBqh0ynB2wv.json?dimension=ou:ImspTQPwCqd&dimension=qrur9Dvnyt5:LT:5&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2024-01-01&endDate=2025-10-01&coordinateField=psigeometry&bbox=-11.25%2C5.61598581915534%2C-8.4375%2C8.407168163601076&clusterSize=67265&includeClusterPoints=false',
                    alias: 'getAnalytics5',
                },
                {
                    method: 'GET',
                    url: '**/analytics/events/cluster/VBqh0ynB2wv.json?dimension=ou:ImspTQPwCqd&dimension=qrur9Dvnyt5:LT:5&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2024-01-01&endDate=2025-10-01&coordinateField=psigeometry&bbox=-16.875%2C5.61598581915534%2C-14.0625%2C8.407168163601076&clusterSize=67265&includeClusterPoints=false',
                    alias: 'getAnalytics6',
                },
                {
                    method: 'GET',
                    url: '**/analytics/events/cluster/VBqh0ynB2wv.json?dimension=ou:ImspTQPwCqd&dimension=qrur9Dvnyt5:LT:5&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2024-01-01&endDate=2025-10-01&coordinateField=psigeometry&bbox=-16.875%2C8.407168163601076%2C-14.0625%2C11.178401873711785&clusterSize=67265&includeClusterPoints=false',
                    alias: 'getAnalytics7',
                },
                // -- engine.query (w/ loadEventCoordinateFieldName)
                {
                    method: 'GET',
                    url: '**/programStages/pTo4uMt3xur?fields=programStageDataElements%5BdisplayInReports%2CdataElement%5Bid%2Ccode%2CdisplayName~rename(name)%2CoptionSet%2CvalueType%5D%5D&paging=false',
                    alias: 'getProgramStages',
                },
                // -- engine.query
                {
                    method: 'GET',
                    url: '**/optionSets/pC3N9N77UmT?fields=id,displayName~rename(name),options%5Bid%2Ccode%2CdisplayName~rename(name)%5D&paging=false',
                    alias: 'getOptionSets',
                },
                // --

                // -- @dhis2/maps-gl - src/layers/ServerCluster.js
                {
                    method: 'GET',
                    url: '**/dhis-web-maps/fonts/Open%20Sans%20Bold/0-255.pbf',
                    alias: 'getFonts',
                },
                // --
            ],
            () => {
                cy.visit(`#/${id}`)
            }
        )
    })

    it('load events layer w/ coordinate field & data download', () => {
        // E2E - Events Layer - Coordinate Field [ugVIdvX2qIG]
        const id = 'ugVIdvX2qIG'
        assertMultipleInterceptedRequests(
            [
                ...commonRequests,
                ...idDependentRequests(id),

                // -- eventLoader - src/loaders/eventLoader.js
                // -- @dhis2/d2 - src/analytics/Analytics.js
                {
                    method: 'GET',
                    url: '**/analytics/events/query/VBqh0ynB2wv.json?dimension=ou:fwxkctgmffZ&dimension=qrur9Dvnyt5:LT:5&dimension=oZg33kd9taw&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2024-01-01&endDate=2025-10-01&coordinateField=F3ogKBuviRA&pageSize=100000',
                    alias: 'getAnalytics1',
                },
                // -- engine.query (w/ loadEventCoordinateFieldName)
                {
                    method: 'GET',
                    url: '**/programStages/pTo4uMt3xur?fields=programStageDataElements%5BdisplayInReports%2CdataElement%5Bid%2Ccode%2CdisplayName~rename(name)%2CoptionSet%2CvalueType%5D%5D&paging=false',
                    alias: 'getProgramStages',
                },
                // -- engine.query
                {
                    method: 'GET',
                    url: '**/optionSets/pC3N9N77UmT?fields=id,displayName~rename(name),options%5Bid%2Ccode%2CdisplayName~rename(name)%5D&paging=false',
                    alias: 'getOptionSets',
                },
                // --

                // -- src/components/layers/download/DataDownloadDialog.js
                // -- @dhis2/d2 - src/analytics/Analytics.js
                // TODO: Why filter is not applied?
                {
                    method: 'GET',
                    url: '**/analytics/events/query/VBqh0ynB2wv.json?dimension=ou:fwxkctgmffZ&dimension=qrur9Dvnyt5&dimension=oZg33kd9taw&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2024-01-01&endDate=2025-10-01&coordinateField=F3ogKBuviRA&pageSize=100000',
                    alias: 'getAnalytics2',
                },
                // --
            ],
            () => {
                cy.visit(`#/${id}`, EXTENDED_TIMEOUT)
                cy.get('[data-test="layercard"]')
                    .find('[data-test="layerlegend"]', EXTENDED_TIMEOUT)
                    .should('exist')
                cy.get('[data-test="moremenubutton"]').first().click()
                cy.get('[data-test="more-menu"]')
                    .find('li')
                    .contains('Download data')
                    .click()
                cy.get('[data-test="data-download-modal"]')
                    .find('button')
                    .contains('Download')
                    .click()
            }
        )
    })

    it('load tracked entities layer', () => {
        // E2E - Tracked Entities Layer [VuYJ5LIgQo2]
        const id = 'VuYJ5LIgQo2'

        const serverVersion = getDhis2Version()
        let layerSpecificRequests
        if (serverVersion.minor === '40') {
            layerSpecificRequests = [
                // -- trackedEntityLoader - src/loaders/trackedEntityLoader.js
                // -- apiFetch - src/util/api.js
                // -- @dhis2/d2 - src/api/Api.js
                {
                    method: 'GET',
                    url: '**/tracker/trackedEntities?skipPaging=true&fields=trackedEntity~rename(id),geometry,relationships&orgUnit=ImspTQPwCqd&ouMode=DESCENDANTS&program=M3xtLkYBlKI&updatedAfter=2000-01-01&updatedBefore=2025-05-19',
                    alias: 'getTrackedEntities1',
                },
                // -- teiRelationshipsParser - src/util/teiRelationshipsParser.js
                // -- apiFetch - src/util/api.js
                // -- @dhis2/d2 - src/api/Api.js
                // TODO: Should this be only TEIs within the same timeframe?
                {
                    method: 'GET',
                    url: '**/tracker/trackedEntities?skipPaging=true&fields=trackedEntity~rename(id),geometry,relationships&orgUnit=ImspTQPwCqd&ouMode=DESCENDANTS&trackedEntityType=Zy2SEgA61ys',
                    alias: 'getTrackedEntities2',
                },
                // --
            ]
        } else {
            layerSpecificRequests = [
                // -- trackedEntityLoader - src/loaders/trackedEntityLoader.js
                // -- apiFetch - src/util/api.js
                // -- @dhis2/d2 - src/api/Api.js
                {
                    method: 'GET',
                    url: '**/tracker/trackedEntities?paging=false&fields=trackedEntity~rename(id),geometry,relationships&orgUnits=ImspTQPwCqd&orgUnitMode=DESCENDANTS&program=M3xtLkYBlKI&updatedAfter=2000-01-01&updatedBefore=2025-05-19',
                    alias: 'getTrackedEntities1',
                },
                // -- teiRelationshipsParser - src/util/teiRelationshipsParser.js
                // -- apiFetch - src/util/api.js
                // -- @dhis2/d2 - src/api/Api.js
                // TODO: Should this be only TEIs within the same timeframe?
                {
                    method: 'GET',
                    url: '**/tracker/trackedEntities?paging=false&fields=trackedEntity~rename(id),geometry,relationships&orgUnits=ImspTQPwCqd&orgUnitMode=DESCENDANTS&trackedEntityType=Zy2SEgA61ys',
                    alias: 'getTrackedEntities2',
                },
                // --
            ]
        }

        assertMultipleInterceptedRequests(
            [
                ...commonRequests,
                ...idDependentRequests(id),
                ...layerSpecificRequests,

                // -- trackedEntityLoader - src/loaders/trackedEntityLoader.js
                // -- apiFetch - src/util/api.js
                // -- @dhis2/d2 - src/api/Api.js
                {
                    method: 'GET',
                    url: '**/relationshipTypes/Mv8R4MPcNcX',
                    alias: 'getRelationshipType',
                },
                {
                    method: 'GET',
                    url: '**/trackedEntityTypes/Zy2SEgA61ys?fields=displayName,featureType',
                    alias: 'getTrackedEntityType1',
                },
                // --

                // -- TrackedEntityLayer - src/components/map/layers/TrackedEntityLayer.js
                // -- engine.query (/w loadDisplayAttributes)
                {
                    method: 'GET',
                    url: '**/trackedEntityTypes/We9I19a3vO1?fields=trackedEntityTypeAttributes%5BdisplayInList%2CtrackedEntityAttribute%5Bid%2CdisplayName~rename(name)%2CoptionSet%2CvalueType%5D%5D&paging=false',
                    alias: 'getTrackedEntityType2',
                },
                {
                    method: 'GET',
                    url: '**/programs/M3xtLkYBlKI?fields=programTrackedEntityAttributes%5BdisplayInList%2CtrackedEntityAttribute%5Bid%2CdisplayName~rename(name)%2CoptionSet%2CvalueType%5D%5D&paging=false',
                    alias: 'getProgram',
                },
                // --
            ],
            () => {
                cy.visit(`#/${id}`)
            }
        )
    })

    it('load facilities layer', () => {
        // E2E - Facilities Layer [kIAUN3dInEz]
        const id = 'kIAUN3dInEz'
        assertMultipleInterceptedRequests(
            [
                ...commonRequests,
                ...idDependentRequests(id),

                // -- facilityLoader - src/loaders/facilityLoader.js
                // -- @dhis2/d2 - src/geofeatures/GeoFeatures.js
                {
                    method: 'GET',
                    url: '**/geoFeatures?_=xE7jOejl9FI&includeGroupSets=true&ou=ou%3AVth0fbpFcsO%3BLEVEL-4&displayProperty=NAME',
                    alias: 'getGeoFeatures',
                },
                // --  engine.query
                {
                    method: 'GET',
                    url: '**/organisationUnitGroupSets/J5jldMd8OHv?fields=organisationUnitGroups%5Bid%2Cname%2Ccolor%2Csymbol%5D',
                    alias: 'getOrganisationUnitGroupSets',
                },
                // --

                // -- @dhis2/maps-gl - src/layers/Markers.js
                {
                    method: 'GET',
                    url: /images\/orgunitgroup\/\d+\.png/,
                    alias: 'getOUGSImage',
                },
                // --
            ],
            () => {
                cy.visit(`#/${id}`)
            }
        )
    })

    it('load org units layer', () => {
        // E2E - Org Units Layer [e2fjmQMtJ0c]
        const id = 'e2fjmQMtJ0c'
        assertMultipleInterceptedRequests(
            [
                ...commonRequests,
                ...idDependentRequests(id),

                // -- orgUnitLoader - src/loaders/orgUnitLoader.js
                // -- @dhis2/d2 - src/analytics/Analytics.js
                {
                    method: 'GET',
                    url: '**/geoFeatures?_=xE7jOejl9FI&includeGroupSets=true&ou=ou%3Aat6UHUQatSo%3BLEVEL-4&displayProperty=NAME',
                    alias: 'getGeoFeatures1',
                },
                {
                    method: 'GET',
                    url: '**/geoFeatures?_=xE7jOejl9FI&coordinateField=ihn1wb9eho8&includeGroupSets=true&ou=ou%3Aat6UHUQatSo%3BLEVEL-4&displayProperty=NAME',
                    alias: 'getGeoFeatures2',
                },
                // -- engine.query
                {
                    method: 'GET',
                    url: '**/organisationUnitGroupSets/J5jldMd8OHv?fields=organisationUnitGroups%5Bid%2Cname%2Ccolor%2Csymbol%5D',
                    alias: 'getOrganisationUnitGroupSet',
                },
                {
                    method: 'GET',
                    url: '**/organisationUnitLevels?fields=id%2Clevel%2CdisplayName~rename(name)&paging=false',
                    alias: 'getOrganisationUnitLevels2',
                },
                // --
            ],
            () => {
                cy.visit(`#/${id}`)
            }
        )
    })

    it('load earth engine layer', () => {
        // E2E - Earth Engine Layer [VebBMVbwxX5]
        const id = 'VebBMVbwxX5'
        assertMultipleInterceptedRequests(
            [
                ...commonRequests,
                ...idDependentRequests(id),

                // -- earthEngineLoader - src/loaders/earthEngineLoader.js
                // -- @dhis2/d2 - src/analytics/Analytics.js
                {
                    method: 'GET',
                    url: '**/geoFeatures?_=xE7jOejl9FI&ou=ou%3AbL4ooGhyHRQ%3BLEVEL-4&displayProperty=NAME',
                    alias: 'getGeoFeatures1',
                },
                {
                    method: 'GET',
                    url: '**/geoFeatures?_=xE7jOejl9FI&ou=ou%3AbL4ooGhyHRQ%3BLEVEL-4&displayProperty=NAME&coordinateField=ihn1wb9eho8',
                    alias: 'getGeoFeatures2',
                },
                // --

                // -- EarthEngineLayer - src/components/map/layers/earthEngine/EarthEngineLayer.js
                // -- getAuthToken - src/util/earthEngine.js
                // -- apiFetch - src/util/api.js
                // -- @dhis2/d2 - src/api/Api.js
                { method: 'GET', url: '**/tokens/google', alias: 'getTokens' },

                // -- @dhis2/maps-gl - src/layers/EarthEngine.js
                {
                    method: 'GET',
                    url: /earthengine-legacy\/maps\/[^/]+\/tiles\/\d+\/\d+\/\d+/,
                    alias: 'getGEETile',
                },
                // --
            ],
            () => {
                cy.visit(`#/${id}`)
            }
        )
    })

    // Test layer cannot be added to E2E DB (base version is 2.38 and GeoJSON layers were introduced later)
    it.skip('load geojson layer', () => {
        // E2E - GeoJSON Layer [gmtrb6NVsDP]
        const id = 'gmtrb6NVsDP'
        assertMultipleInterceptedRequests(
            [
                ...commonRequests,
                ...idDependentRequests(id),

                // -- geoJsonUrlLoader - src/loaders/geoJsonUrlLoader.js
                // -- engine.query
                {
                    method: 'GET',
                    url: '**/externalMapLayers/PJnZoIJ9hh7?fields=id%2CdisplayName~rename(name)%2Cservice%2Curl%2Cattribution%2CmapService%2Clayers%2CimageFormat%2CmapLayerPosition%2ClegendSet%2ClegendSetUrl',
                    alias: 'getExternalMapLayer1',
                },
                {
                    method: 'GET',
                    url: 'https://raw.githubusercontent.com/openlayers/openlayers/refs/heads/main/examples/data/geojson/point-samples.geojson',
                    alias: 'getExternalMapLayer2',
                },
                // --
            ],
            () => {
                cy.visit(`#/${id}`)
            }
        )
    })
})
