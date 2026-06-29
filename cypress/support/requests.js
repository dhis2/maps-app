const encoder = (str) => {
    const charMap = {
        ':': '%3A',
        ';': '%3B',
        '[': '%5B',
        ']': '%5D',
    }
    const escapeRegexChar = (char) =>
        char.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&')
    return str.replace(
        new RegExp(
            `[${Object.keys(charMap).map(escapeRegexChar).join('')}]`,
            'g'
        ),
        (char) => charMap[char]
    )
}

const requests = {
    // App requests
    getAppServiceData_Me: { method: 'GET', url: '**/me?fields=id' },
    getAppServiceData_UserSettings: { method: 'GET', url: '**/userSettings' },
    getAppServiceData_SystemInfo: { method: 'GET', url: '**/system/info' },
    getHeaderBar_SystemSettings1: {
        method: 'GET',
        url: '**/systemSettings/applicationTitle',
    },
    getHeaderBar_SystemSettings2: {
        method: 'GET',
        url: '**/systemSettings/helpPageLink',
    },
    getHeaderBar_Me1: { method: 'GET', url: '**/me/dashboard' },
    getHeaderBar_Me2: {
        method: 'GET',
        url: '**/me?fields=authorities,avatar,email,name,settings',
    },
    getHeaderBar_DhisWebCommons: {
        method: 'GET',
        url: '**/dhis-web-commons/menu/getModules.action',
    },
    getHeaderBar_StaticContent: {
        method: 'GET',
        url: '**/staticContent/logo_banner',
    },
    getDataStoreProvider_DataStore1: {
        method: 'GET',
        url: '**/dataStore/analytics/settings',
    },
    getDataStoreProvider_DataStore2: {
        method: 'GET',
        url: '**/dataStore/analytics/savedObjects',
    },
    getDataStoreProvider_UserDataStore1: {
        method: 'GET',
        url: '**/userDataStore/analytics/settings',
    },
    getDataStoreProvider_UserDataStore2: {
        method: 'GET',
        url: '**/userDataStore/analytics/savedObjects',
    },
    getCachedDataProvider_Me: {
        method: 'GET',
        url: '**/me?fields=id%2Cusername%2CdisplayName~rename(name)%2Cauthorities%2Csettings%5BkeyAnalysisDisplayProperty%2CkeyUiLocale%5D',
    },
    getCachedDataProvider_SystemSettings: {
        method: 'GET',
        url: '**/systemSettings?key=keyAnalysisRelativePeriod,keyHideDailyPeriods,keyHideWeeklyPeriods,keyHideBiWeeklyPeriods,keyHideMonthlyPeriods,keyHideBiMonthlyPeriods,keyDefaultBaseMap,orgUnitCentroidsInEventsAnalytics,keyBingMapsApiKey,keyAzureMapsApiKey',
    },
    getCachedDataProvider_ExternalMapLayers: {
        method: 'GET',
        url: '**/externalMapLayers?fields=id%2CdisplayName~rename(name)%2Cservice%2Curl%2Cattribution%2CmapService%2Clayers%2CimageFormat%2CmapLayerPosition%2ClegendSet%2ClegendSetUrl&paging=false',
    },
    getCachedDataProvider_SystemInfo: {
        method: 'GET',
        url: '**/system/info?fields=calendar%2CdateFormat',
    },
    getOrgUnitsProvider_OrganisationUnits: {
        method: 'GET',
        url: '**/organisationUnits?fields=id,displayName~rename(name),path&userDataViewFallback=true',
    },
    getOrgUnitsProvider_OrganisationUnitLevels: {
        method: 'GET',
        url: '**/organisationUnitLevels?fields=id,displayName~rename(name),level&order=level%3Aasc&paging=false',
    },
    getLoadDataStore_DataStore1: {
        method: 'GET',
        url: '**/dataStore',
        alias: '',
    },
    getLoadDataStore_DataStore2: {
        method: 'GET',
        url: '**/dataStore/DHIS2_MAPS_APP_CORE/MANAGED_LAYER_SOURCES',
    },
    getLoadMap_BasemapTile: {
        method: 'GET',
        url: /cartodb-basemaps-[abc]\.global\.ssl\.fastly\.net\/light_all\/\d+\/\d+\/\d+\.png/,
    },

    // Map requests
    getMap: (id) => ({
        method: 'GET',
        url: `**/maps/${id}?fields=id%2Cuser%2Cname%2CdisplayName%2Cdescription%2CdisplayDescription%2Clongitude%2Clatitude%2Czoom%2Cbasemap%2Ccreated%2ClastUpdated%2Caccess%2Cupdate%2Cmanage%2Cdelete%2Chref%2C%20mapViews%5B*%2Ccolumns%5Bdimension%2Cfilter%2Citems%5BdimensionItem~rename(id)%2CdimensionItemType%2CdisplayName~rename(name)%5D%5D%2Crows%5Bdimension%2Cfilter%2Citems%5BdimensionItem~rename(id)%2CdimensionItemType%2CdisplayName~rename(name)%5D%5D%2Cfilters%5Bdimension%2Cfilter%2Citems%5BdimensionItem~rename(id)%2CdimensionItemType%2CdisplayName~rename(name)%5D%5D%2CorganisationUnits%5Bid%2Cpath%5D%2CdataDimensionItems%2Cprogram%5Bid%2CdisplayName~rename(name)%5D%2CprogramStage%5Bid%2CdisplayName~rename(name)%5D%2ClegendSet%5Bid%2CdisplayName~rename(name)%5D%2CtrackedEntityType%5Bid%2CdisplayName~rename(name)%5D%2CorganisationUnitSelectionMode%2C!href%2C!publicAccess%2C!rewindRelativePeriods%2C!userOrganisationUnit%2C!userOrganisationUnitChildren%2C!userOrganisationUnitGrandChildren%2C!externalAccess%2C!access%2C!relativePeriods%2C!columnDimensions%2C!rowDimensions%2C!filterDimensions%2C!user%2C!organisationUnitGroups%2C!itemOrganisationUnitGroups%2C!userGroupAccesses%2C!indicators%2C!dataElements%2C!dataElementOperands%2C!dataElementGroups%2C!dataSets%2C!periods%2C!organisationUnitLevels%2C!sortOrder%2C!topLimit%5D`,
    }),
    postDataStatistics: (id) => ({
        method: 'POST',
        url: `**/dataStatistics?favorite=${id}&eventType=MAP_VIEW`,
    }),

    // Thematic layer requests
    getThematic_Analytics1: {
        method: 'GET',
        url: encoder(
            '**/analytics?dimension=dx:Uvn6LCg7dVU,ou:LEVEL-4;PMa2VCrupOd&filter=J5jldMd8OHv:EYbopBOJWsW&filter=pe:THIS_YEAR&displayProperty=NAME&skipMeta=true&skipData=false'
        ),
    },
    getThematic_Analytics2: {
        method: 'GET',
        url: encoder(
            '**/analytics?dimension=dx:Uvn6LCg7dVU,ou:PMa2VCrupOd;LEVEL-4&filter=J5jldMd8OHv:EYbopBOJWsW&filter=pe:THIS_YEAR&displayProperty=NAME&skipMeta=false&skipData=true&includeMetadataDetails=true'
        ),
    },
    getThematic_GeoFeatures1: {
        method: 'GET',
        url: encoder(
            '**/geoFeatures?ou=ou:PMa2VCrupOd;LEVEL-4&displayProperty=name&_=xE7jOejl9FI'
        ),
    },
    getThematic_GeoFeatures2: {
        method: 'GET',
        url: encoder(
            '**/geoFeatures?ou=ou:PMa2VCrupOd;LEVEL-4&displayProperty=name&coordinateField=ihn1wb9eho8&_=xE7jOejl9FI'
        ),
    },
    getThematic_LegendSets: {
        method: 'GET',
        url: '**/legendSets/fqs276KXCXi?fields=id,displayName~rename(name),legends%5Bid%2CdisplayName~rename(name)%2CstartValue%2CendValue%2Ccolor%5D&paging=false',
    },

    // Events layer requests A (w/ server cluster)
    getEventsCluster_Analytics1: {
        method: 'GET',
        url: encoder(
            '**/analytics/events/count/VBqh0ynB2wv?dimension=ou:ImspTQPwCqd,qrur9Dvnyt5:LT:5&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2024-01-01&endDate=2025-10-01&coordinateField=psigeometry'
        ),
    },
    getEventsCluster_Analytics2: {
        method: 'GET',
        url: encoder(
            '**/analytics/events/cluster/VBqh0ynB2wv?dimension=ou:ImspTQPwCqd,qrur9Dvnyt5:LT:5&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2024-01-01&endDate=2025-10-01&coordinateField=psigeometry&bbox=-14.0625%2C8.407168163601076%2C-11.25%2C11.178401873711785&clusterSize=67265&includeClusterPoints=false'
        ),
    },
    getEventsCluster_Analytics3: {
        method: 'GET',
        url: encoder(
            '**/analytics/events/cluster/VBqh0ynB2wv?dimension=ou:ImspTQPwCqd,qrur9Dvnyt5:LT:5&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2024-01-01&endDate=2025-10-01&coordinateField=psigeometry&bbox=-14.0625%2C5.61598581915534%2C-11.25%2C8.407168163601076&clusterSize=67265&includeClusterPoints=false'
        ),
    },
    getEventsCluster_Analytics4: {
        method: 'GET',
        url: encoder(
            '**/analytics/events/cluster/VBqh0ynB2wv?dimension=ou:ImspTQPwCqd,qrur9Dvnyt5:LT:5&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2024-01-01&endDate=2025-10-01&coordinateField=psigeometry&bbox=-11.25%2C8.407168163601076%2C-8.4375%2C11.178401873711785&clusterSize=67265&includeClusterPoints=false'
        ),
    },
    getEventsCluster_Analytics5: {
        method: 'GET',
        url: encoder(
            '**/analytics/events/cluster/VBqh0ynB2wv?dimension=ou:ImspTQPwCqd,qrur9Dvnyt5:LT:5&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2024-01-01&endDate=2025-10-01&coordinateField=psigeometry&bbox=-11.25%2C5.61598581915534%2C-8.4375%2C8.407168163601076&clusterSize=67265&includeClusterPoints=false'
        ),
    },
    getEventsCluster_Analytics6: {
        method: 'GET',
        url: encoder(
            '**/analytics/events/cluster/VBqh0ynB2wv?dimension=ou:ImspTQPwCqd,qrur9Dvnyt5:LT:5&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2024-01-01&endDate=2025-10-01&coordinateField=psigeometry&bbox=-16.875%2C5.61598581915534%2C-14.0625%2C8.407168163601076&clusterSize=67265&includeClusterPoints=false'
        ),
    },
    getEventsCluster_Analytics7: {
        method: 'GET',
        url: encoder(
            '**/analytics/events/cluster/VBqh0ynB2wv?dimension=ou:ImspTQPwCqd,qrur9Dvnyt5:LT:5&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2024-01-01&endDate=2025-10-01&coordinateField=psigeometry&bbox=-16.875%2C8.407168163601076%2C-14.0625%2C11.178401873711785&clusterSize=67265&includeClusterPoints=false'
        ),
    },
    getEventsCluster_ProgramStages: {
        method: 'GET',
        url: '**/programStages/pTo4uMt3xur?fields=programStageDataElements%5BdisplayInReports%2CdataElement%5Bid%2Ccode%2CdisplayName~rename(name)%2CoptionSet%2CvalueType%5D%5D&paging=false',
    },
    getEventsCluster_OptionSets: {
        method: 'GET',
        url: '**/optionSets/pC3N9N77UmT?fields=id,displayName~rename(name),options%5Bid%2Ccode%2CdisplayName~rename(name)%5D&paging=false',
    },
    getEventsCluster_Fonts: {
        method: 'GET',
        url: '**/dhis-web-maps/fonts/Open%20Sans%20Bold/0-255.pbf',
    },

    // Events layer requests B (w/ coordinate field & data download)
    getEventsStandard_Analytics1: {
        method: 'GET',
        url: encoder(
            '**/analytics/events/query/VBqh0ynB2wv?dimension=oZg33kd9taw,ou:fwxkctgmffZ,qrur9Dvnyt5:LT:5&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2024-01-01&endDate=2025-10-01&coordinateField=F3ogKBuviRA&pageSize=100000'
        ),
    },
    getEventsStandard_ProgramStages: {
        method: 'GET',
        url: encoder(
            '**/programStages/pTo4uMt3xur?fields=programStageDataElements[displayInReports%2CdataElement[id%2Ccode%2CdisplayName~rename(name)%2CoptionSet%2CvalueType]]&paging=false'
        ),
    },
    getEventsStandard_OptionSets: {
        method: 'GET',
        url: '**/optionSets/pC3N9N77UmT?fields=id,displayName~rename(name),options%5Bid%2Ccode%2CdisplayName~rename(name)%5D&paging=false',
    },
    getEventsStandard_Analytics2: {
        method: 'GET',
        url: encoder(
            '**/analytics/events/query/VBqh0ynB2wv?dimension=oZg33kd9taw,ou:fwxkctgmffZ,qrur9Dvnyt5&stage=pTo4uMt3xur&coordinatesOnly=true&startDate=2024-01-01&endDate=2025-10-01&coordinateField=F3ogKBuviRA&pageSize=100000'
        ),
    },

    // Tracked entity layer requests
    getTrackedEntities40_TrackedEntities1: {
        method: 'GET',
        url: '**/tracker/trackedEntities?fields=trackedEntity~rename(id),geometry,relationships&orgUnit=ImspTQPwCqd&ouMode=DESCENDANTS&program=M3xtLkYBlKI&updatedAfter=2000-01-01&updatedBefore=2025-05-19&skipPaging=true', // !CHANGE: skipPaging=true moved to the end
    },
    getTrackedEntities40_TrackedEntities2: {
        method: 'GET',
        url: '**/tracker/trackedEntities?fields=trackedEntity~rename(id),geometry,relationships&orgUnit=ImspTQPwCqd&ouMode=DESCENDANTS&trackedEntityType=Zy2SEgA61ys&skipPaging=true', // !CHANGE: skipPaging=true moved to the end
    },
    getTrackedEntities41_TrackedEntities1: {
        method: 'GET',
        url: '**/tracker/trackedEntities?fields=trackedEntity~rename(id),geometry,relationships&orgUnits=ImspTQPwCqd&orgUnitMode=DESCENDANTS&program=M3xtLkYBlKI&updatedAfter=2000-01-01&updatedBefore=2025-05-19&paging=false', // !CHANGE: paging=false moved to the end
    },
    getTrackedEntities41_TrackedEntities2: {
        method: 'GET',
        url: '**/tracker/trackedEntities?fields=trackedEntity~rename(id),geometry,relationships&orgUnits=ImspTQPwCqd&orgUnitMode=DESCENDANTS&trackedEntityType=Zy2SEgA61ys&paging=false', // !CHANGE: paging=false moved to the end
    },
    getTrackedEntities_RelationshipType: {
        method: 'GET',
        url: '**/relationshipTypes/Mv8R4MPcNcX',
    },
    getTrackedEntities_TrackedEntityType1: {
        method: 'GET',
        old: '**/trackedEntityTypes/Zy2SEgA61ys?fields=displayName,featureType',
        url: '**/trackedEntityTypes/Zy2SEgA61ys?fields=displayName%2CfeatureType',
    },
    getTrackedEntities_TrackedEntityType2: {
        method: 'GET',
        url: '**/trackedEntityTypes/We9I19a3vO1?fields=trackedEntityTypeAttributes%5BdisplayInList%2CtrackedEntityAttribute%5Bid%2CdisplayName~rename(name)%2CoptionSet%2CvalueType%5D%5D&paging=false',
    },
    getTrackedEntities_Program: {
        method: 'GET',
        url: '**/programs/M3xtLkYBlKI?fields=programTrackedEntityAttributes%5BdisplayInList%2CtrackedEntityAttribute%5Bid%2CdisplayName~rename(name)%2CoptionSet%2CvalueType%5D%5D&paging=false',
    },

    // Facilities layer requests
    getFacilities_GeoFeatures: {
        method: 'GET',
        url: encoder(
            '**/geoFeatures?ou=ou:Vth0fbpFcsO;LEVEL-4&displayProperty=name&includeGroupSets=true&_=xE7jOejl9FI'
        ),
    },
    getFacilities_OrganisationUnitGroupSets: {
        method: 'GET',
        url: '**/organisationUnitGroupSets/J5jldMd8OHv?fields=name%2CorganisationUnitGroups%5Bid%2Cname%2Ccolor%2Csymbol%5D',
    },
    getFacilities_OUGSImage: {
        method: 'GET',
        url: /images\/orgunitgroup\/\d+\.png/,
    },

    // Org units layer requests
    getOrgUnits_GeoFeatures1: {
        method: 'GET',
        old: '**/geoFeatures?_=xE7jOejl9FI&includeGroupSets=true&ou=ou%3Aat6UHUQatSo%3BLEVEL-4&displayProperty=NAME',
        url: encoder(
            '**/geoFeatures?ou=ou:at6UHUQatSo;LEVEL-4&displayProperty=name&includeGroupSets=true&_=xE7jOejl9FI'
        ),
    },
    getOrgUnits_GeoFeatures2: {
        method: 'GET',
        url: encoder(
            '**/geoFeatures?ou=ou:at6UHUQatSo;LEVEL-4&displayProperty=name&includeGroupSets=true&coordinateField=ihn1wb9eho8&_=xE7jOejl9FI'
        ),
    },
    getOrgUnits_OrganisationUnitGroupSet: {
        method: 'GET',
        url: '**/organisationUnitGroupSets/J5jldMd8OHv?fields=name%2CorganisationUnitGroups%5Bid%2Cname%2Ccolor%2Csymbol%5D',
    },
    getOrgUnits_OrganisationUnitLevels: {
        method: 'GET',
        url: '**/organisationUnitLevels?fields=id%2Clevel%2CdisplayName~rename(displayName)%2Cname&paging=false',
    },

    // Earth engine layer requests
    getEarthEngine_GeoFeatures1: {
        method: 'GET',
        url: '**/geoFeatures?ou=ou%3AbL4ooGhyHRQ%3BLEVEL-4&displayProperty=name&_=xE7jOejl9FI',
    },
    getEarthEngine_GeoFeatures2: {
        method: 'GET',
        url: '**/geoFeatures?ou=ou%3AbL4ooGhyHRQ%3BLEVEL-4&displayProperty=name&coordinateField=ihn1wb9eho8&_=xE7jOejl9FI',
    },
    getEarthEngine_Token: { method: 'GET', url: '**/tokens/google' },
    getEarthEngine_Tile: {
        method: 'GET',
        url: /earthengine-legacy\/maps\/[^/]+\/tiles\/\d+\/\d+\/\d+/,
    },

    // Geojson layer requests
    getGeoJson_getExternalMapLayer1: {
        method: 'GET',
        url: '**/externalMapLayers/PJnZoIJ9hh7?fields=id%2CdisplayName~rename(name)%2Cservice%2Curl%2Cattribution%2CmapService%2Clayers%2CimageFormat%2CmapLayerPosition%2ClegendSet%2ClegendSetUrl',
    },
    getGeoJson_getExternalMapLayer2: {
        method: 'GET',
        url: 'https://raw.githubusercontent.com/openlayers/openlayers/refs/heads/main/examples/data/geojson/point-samples.geojson',
    },
}

export const getRequest = (alias, id) => {
    const req = requests[alias]

    if (!req) {
        throw new Error(`Request alias "${alias}" not found.`)
    }

    if (typeof req === 'function') {
        if (!id) {
            throw new Error(
                `Request alias "${alias}" requires an id, but none was provided.`
            )
        }
        return {
            ...req(id),
            alias,
        }
    }

    return {
        ...req,
        alias,
    }
}

export const getRequests = (aliases, id) => {
    return aliases.map((alias) => getRequest(alias, id))
}
