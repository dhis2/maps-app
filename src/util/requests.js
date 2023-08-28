import { getInstance as getD2 } from 'd2'
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

// Fetch a single externalLayer
export const getExternalLayer = async (id) => {
    const d2 = await getD2()
    return d2.models.externalMapLayers.get(id)
}

// https://davidwalsh.name/query-string-javascript
export const getUrlParameter = (name) => {
    name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]')
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)')
    const results = regex.exec(location.search)
    return results === null
        ? ''
        : decodeURIComponent(results[1].replace(/\+/g, ' '))
}
