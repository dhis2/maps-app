import { getInstance as getD2 } from 'd2'
import { DEFAULT_SYSTEM_SETTINGS } from '../constants/settings.js'
import { apiFetch } from './api.js'
import { getMigratedMapConfig } from './getMigratedMapConfig.js'
import { mapFields } from './helpers.js'
import {
    METADATA_FORMAT_ID,
    METADATA_FORMAT_CODE,
    METADATA_FORMAT_NAME,
} from './metadataFormats.js'
// API requests

// Fetch one favorite
export const mapRequest = async (id, keyDefaultBaseMap) => {
    const d2 = await getD2()

    return d2.models.map
        .get(id, {
            fields: mapFields(),
        })
        .then((map) => getMigratedMapConfig(map, keyDefaultBaseMap))
}

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

// const fetchOrgUnitsQuery = {
//     resource: 'organisationUnits',
//     params: {
//         userDataViewFallback: true,
//         fields:
//             'id,path,displayName,children[id,path,displayName,children::isNotEmpty]',
//     },
// };

export const fetchOrgUnits = async () => {
    // TODO - use d2 until correct dataQuery format can be determined
    const d2 = await getD2()
    const collection = await d2.models.organisationUnits.list({
        userDataViewFallback: true,
        fields: 'id,path,displayName,children[id,path,displayName,children::isNotEmpty]',
    })
    return collection.toArray()
}

const fetchExternalLayersQuery = {
    resource: 'externalMapLayers',
    params: {
        paging: false,
        fields: 'id,displayName~rename(name),service,url,attribution,mapService,layers,imageFormat,mapLayerPosition,legendSet,legendSetUrl',
    },
}

export const fetchExternalLayers = async (engine) =>
    engine.query({ externalLayers: fetchExternalLayersQuery })

// For plugin - use d2
export const fetchExternalLayersD2 = async () => {
    const d2 = await getD2()
    const layers = await d2.models.externalMapLayers.list()
    return layers.toArray()
}

// Fetch a single externalLayer
export const getExternalLayer = async (id) => {
    const d2 = await getD2()
    return d2.models.externalMapLayers.get(id)
}

export const fetchSystemSettings = (keys) =>
    apiFetch(`/systemSettings/?key=${keys.join(',')}`).then((settings) =>
        Object.assign({}, DEFAULT_SYSTEM_SETTINGS, settings)
    )

// https://davidwalsh.name/query-string-javascript
export const getUrlParameter = (name) => {
    name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]')
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)')
    const results = regex.exec(location.search)
    return results === null
        ? ''
        : decodeURIComponent(results[1].replace(/\+/g, ' '))
}

const formatEnum = {
    [METADATA_FORMAT_ID]: 'id',
    [METADATA_FORMAT_NAME]: 'name',
    [METADATA_FORMAT_CODE]: 'code',
}

export const getEventColumns = async (
    layer,
    { format = METADATA_FORMAT_NAME, d2 }
) => {
    const result = await d2.models.programStage.get(layer.programStage.id, {
        fields: `programStageDataElements[displayInReports,dataElement[id,code,displayName~rename(name)},optionSet]]`,
        paging: false,
    })
    const formatKey = formatEnum[format]
    return result.programStageDataElements
        .filter((el) => el.displayInReports)
        .map((el) => ({
            dimension: el.dataElement.id,
            name: el.dataElement[formatKey],
        }))
}
