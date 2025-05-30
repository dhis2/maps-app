import { getMigratedMapConfig } from './getMigratedMapConfig.js'
import { mapFields } from './helpers.js'

const MAP_QUERY = {
    resource: 'maps',
    id: ({ id }) => id,
    params: ({ withSubscribers }) => ({
        fields: mapFields(withSubscribers),
    }),
}

const MAP_NAME_DESC_QUERY = {
    resource: 'maps',
    id: ({ id }) => id,
    params: {
        fields: 'id,name,description,displayName,displayDescription',
    },
}

const MAP_SUBSCRIBERS_QUERY = {
    resource: 'maps',
    id: ({ id }) => id,
    params: {
        fields: 'subscribers',
    },
}

// API requests

export const fetchMap = async ({
    id,
    engine,
    defaultBasemap,
    withSubscribers,
}) =>
    engine
        .query(
            { map: MAP_QUERY },
            {
                variables: {
                    id,
                    withSubscribers,
                },
            }
        )
        .then((map) => getMigratedMapConfig(map.map, defaultBasemap))
        .catch(() => {
            throw new Error(`Could not load map with id "${id}"`)
        })

export const fetchMapNameDesc = async ({ id, engine }) =>
    engine
        .query(
            { map: MAP_NAME_DESC_QUERY },
            {
                variables: {
                    id,
                },
            }
        )
        .catch(() => {
            throw new Error(`Could not load map with id "${id}"`)
        })

export const fetchMapSubscribers = async ({ id, engine }) =>
    engine
        .query(
            { map: MAP_SUBSCRIBERS_QUERY },
            {
                variables: {
                    id,
                },
            }
        )
        .then((map) => map.map)
        .catch(() => {
            throw new Error(`Could not load map with id "${id}"`)
        })

export const EXTERNAL_MAP_LAYERS_QUERY = {
    resource: 'externalMapLayers',
    params: {
        fields: 'id,displayName~rename(name),service,url,attribution,mapService,layers,imageFormat,mapLayerPosition,legendSet,legendSetUrl',
        paging: false,
    },
}

// Fetch a single externalLayer
export const EXTERNAL_MAP_LAYER_QUERY = {
    resource: 'externalMapLayers',
    id: ({ id }) => id,
    params: {
        fields: 'id,displayName~rename(name),service,url,attribution,mapService,layers,imageFormat,mapLayerPosition,legendSet,legendSetUrl',
    },
}

export const OPTION_SET_QUERY = {
    optionSet: {
        resource: 'optionSets',
        id: ({ id }) => id,
        params: {
            fields: [
                'id',
                'displayName~rename(name)',
                'options[id,code,displayName~rename(name)]',
            ],
            paging: false,
        },
    },
}

// Load a single legend set
export const LEGEND_SET_QUERY = {
    legendSet: {
        resource: 'legendSets',
        id: ({ id }) => id,
        params: {
            fields: [
                'id',
                'displayName~rename(name)',
                'legends[id,displayName~rename(name),startValue,endValue,color]',
            ],
            paging: false,
        },
    },
}

export const GEOFEATURES_QUERY = {
    geoFeatures: {
        resource: 'geoFeatures',
        params: ({
            ou,
            keyAnalysisDisplayProperty,
            includeGroupSets,
            coordinateField,
            userId,
        }) => ({
            ou,
            displayProperty: keyAnalysisDisplayProperty,
            includeGroupSets,
            coordinateField,
            _: userId,
        }),
    },
}
