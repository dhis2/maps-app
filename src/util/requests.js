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

export const fetchExternalLayersQuery = {
    resource: 'externalMapLayers',
    params: {
        fields: 'id,displayName~rename(name),service,url,attribution,mapService,layers,imageFormat,mapLayerPosition,legendSet,legendSetUrl',
        paging: false,
    },
}

// Fetch a single externalLayer
export const fetchExternalLayerQuery = {
    resource: 'externalMapLayers',
    id: ({ id }) => id,
    params: {
        fields: 'id,displayName~rename(name),service,url,attribution,mapService,layers,imageFormat,mapLayerPosition,legendSet,legendSetUrl',
    },
}
