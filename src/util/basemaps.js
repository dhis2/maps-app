import i18n from '@dhis2/d2-i18n'
import { layerTypes } from '../components/map/MapApi.js'
import { defaultBasemaps, getFallbackBasemap } from '../constants/basemaps.js'
import {
    MAP_SERVICE_KEY_TESTS,
    MAP_LAYER_POSITION_BASEMAP,
} from '../constants/layers.js'
import { createExternalBasemapLayer, supportedMapServices } from './external.js'

export const validateMapServiceKeys = async (systemSettings) => {
    const keysStatus = Object.values(MAP_SERVICE_KEY_TESTS)
        .flat()
        .reduce((acc, { type }) => {
            acc[type] = false
            return acc
        }, {})

    for (const keyName of Object.keys(MAP_SERVICE_KEY_TESTS)) {
        if (systemSettings[keyName]) {
            for (const { type, url } of MAP_SERVICE_KEY_TESTS[keyName]) {
                try {
                    const response = await fetch(
                        `${url}${systemSettings[keyName]}`
                    )
                    if (response.ok) {
                        keysStatus[type] = systemSettings[keyName]
                    } else {
                        console.warn(
                            i18n.t(
                                '{{keyName}} is not valid for layer type: {{type}}',
                                {
                                    keyName,
                                    type,
                                    nsSeparator: '^^',
                                }
                            )
                        )
                    }
                } catch (error) {
                    continue
                }
            }
        } else {
            console.warn(
                i18n.t(
                    '{{keyName}} is not provided for layer type(s): {{types}}',
                    {
                        keyName,
                        types: MAP_SERVICE_KEY_TESTS[keyName]
                            .map((l) => l.type)
                            .join(', '),
                        nsSeparator: '^^',
                    }
                )
            )
        }
    }
    return keysStatus
}

export const getBasemapList = async ({
    externalMapLayers,
    systemSettings,
    validationFn = validateMapServiceKeys,
}) => {
    const keysStatus = await validationFn(systemSettings)
    const externalBasemaps = externalMapLayers
        .filter(
            (layer) =>
                layer.mapLayerPosition === MAP_LAYER_POSITION_BASEMAP &&
                supportedMapServices.includes(layer.mapService)
        )
        .map(createExternalBasemapLayer)
        .filter((basemap) => layerTypes.includes(basemap.config.type))

    const basemapList = defaultBasemaps()
        .filter(
            ({ config: { type } }) =>
                layerTypes.includes(type) && (keysStatus[type] ?? true)
        )
        .map((basemap) => {
            if (keysStatus[basemap.config.type]) {
                basemap.config.apiKey = keysStatus[basemap.config.type]
            }
            return basemap
        })
        .concat(externalBasemaps)

    return basemapList
}

export const getBasemapOrFallback = ({
    basemaps,
    id,
    defaultId,
    onMissing,
}) => {
    let basemap = basemaps.find(({ id: basemapId }) => basemapId === id)

    if (!basemap) {
        if (id && typeof onMissing === 'function') {
            const msg = i18n.t(
                'Could not load: {{id}} — using the default basemap instead.',
                { id, nsSeparator: '^^' }
            )
            onMissing(msg)
        }

        basemap =
            basemaps.find(({ id: basemapId }) => basemapId === defaultId) ||
            getFallbackBasemap()
    }

    return basemap
}
