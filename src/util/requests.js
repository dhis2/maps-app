import { getMigratedMapConfig } from './getMigratedMapConfig.js'
import { mapFields } from './helpers.js'

// API requests

const fetchMapQuery = {
    resource: 'maps',
    id: ({ id }) => id,
    params: {
        fields: mapFields(),
    },
}

const fetchMapNameDescQuery = {
    resource: 'maps',
    id: ({ id }) => id,
    params: {
        fields: 'id,name,description,displayName,displayDescription',
    },
}

export const fetchMapNameDesc = async (id, engine) =>
    engine
        .query(
            { map: fetchMapNameDescQuery },
            {
                variables: {
                    id,
                },
            }
        )
        .catch(() => {
            throw new Error(`Could not load map with id "${id}"`)
        })

export const fetchMap = async (id, engine, keyDefaultBaseMap) =>
    engine
        .query(
            { map: fetchMapQuery },
            {
                variables: {
                    id,
                },
            }
        )
        .then((map) => getMigratedMapConfig(map.map, keyDefaultBaseMap))
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
