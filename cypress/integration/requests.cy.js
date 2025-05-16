import { assertMultipleInterceptedRequests } from '../support/util.js'

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

describe('Multiple API requests on same trigger', () => {
    it('load thematic layer', () => {
        const id = 'zDP78aJU8nX'
        assertMultipleInterceptedRequests(
            [
                ...commonRequests,
                ...idDependentRequests(id),

                // TODO Add AssociatedGeometries

                // -- thematicLoader - src/loaders/thematicLoader.js
                // -- @dhis2/d2 - src/analytics/Analytics.js
                {
                    method: 'GET',
                    url: '**/analytics.json?dimension=dx:Uvn6LCg7dVU&dimension=ou:ImspTQPwCqd;LEVEL-2&filter=pe:THIS_YEAR&displayProperty=NAME&skipData=false&skipMeta=true',
                    alias: 'getAnalytics1',
                },
                {
                    method: 'GET',
                    url: '**/analytics.json?dimension=ou:ImspTQPwCqd;LEVEL-2&dimension=dx:Uvn6LCg7dVU&filter=pe:THIS_YEAR&displayProperty=NAME&skipMeta=false&skipData=true&includeMetadataDetails=true',
                    alias: 'getAnalytics2',
                },
                {
                    method: 'GET',
                    url: '**/geoFeatures?_=xE7jOejl9FI&ou=ou%3AImspTQPwCqd%3BLEVEL-2&displayProperty=NAME',
                    alias: 'getGeoFeatures',
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

    it('load events layer', () => {
        const id = 'kNYqHu3e7o3'
        assertMultipleInterceptedRequests(
            [
                ...commonRequests,
                ...idDependentRequests(id),

                // TODO Add cluster - qR8xw5pvVIn (server)
                // TODO Add data item style - iicHgLpIYlm

                // -- eventLoader - src/loaders/eventLoader.js
                // -- @dhis2/d2 - src/analytics/Analytics.js
                {
                    method: 'GET',
                    url: '**/analytics/events/query/VBqh0ynB2wv.json?dimension=ou:at6UHUQatSo&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2024-01-01&endDate=2025-10-01&coordinateField=psigeometry&pageSize=100000',
                    alias: 'getAnalytics',
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
            ],
            () => {
                cy.visit(`#/${id}`)
            }
        )
    })

    it.skip('load tracked entities layer', () => {
        const id = 'pending'
        assertMultipleInterceptedRequests(
            [
                ...commonRequests,
                ...idDependentRequests(id),

                // TODO All (needs to be created)
            ],
            () => {
                cy.visit(`#/${id}`)
            }
        )
    })

    it('load facilities layer', () => {
        const id = 'g5Zjei47geR'
        assertMultipleInterceptedRequests(
            [
                ...commonRequests,
                ...idDependentRequests(id),

                // -- facilityLoader - src/loaders/facilityLoader.js
                // -- @dhis2/d2 - src/analytics/Analytics.js
                {
                    method: 'GET',
                    url: '**/geoFeatures?includeGroupSets=true&ou=ou%3AVth0fbpFcsO%3BLEVEL-4&displayProperty=NAME',
                    alias: 'getGeoFeatures',
                },
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

    it.only('load org units layer', () => {
        const id = 'qIu9nspIPhN'
        assertMultipleInterceptedRequests(
            [
                ...commonRequests,
                ...idDependentRequests(id),

                // TODO Add OUGSs
                // TODO Add AssociatedGeometries

                // -- orgUnitLoader - src/loaders/orgUnitLoader.js
                // -- @dhis2/d2 - src/analytics/Analytics.js
                {
                    method: 'GET',
                    url: '**/geoFeatures?_=xE7jOejl9FI&includeGroupSets=false&ou=ou%3AImspTQPwCqd%3BLEVEL-3&displayProperty=NAME',
                    alias: 'getGeoFeatures',
                },
                // -- engine.query
                {
                    method: 'GET',
                    url: '**/organisationUnitLevels?fields=id%2Clevel%2CdisplayName~rename(name)&paging=false',
                    alias: 'getOrganisationUnitLevels',
                },
                // --
            ],
            () => {
                cy.visit(`#/${id}`)
            }
        )
    })

    it('load earth engine layer', () => {
        const id = 'HVIYhS1C4ft'
        assertMultipleInterceptedRequests(
            [
                ...commonRequests,
                ...idDependentRequests(id),

                // TODO Add OUs

                // -- earthEngineLoader - src/loaders/earthEngineLoader.js
                // -- @dhis2/maps-gl - src/layers/EarthEngine.js
                { method: 'GET', url: '**/tokens/google', alias: 'getTokens' },
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
})
