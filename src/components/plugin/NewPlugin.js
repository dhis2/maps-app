import { useDataEngine } from '@dhis2/app-runtime'
import { isValidUid } from 'd2/uid'
import PropTypes from 'prop-types'
import React, { useState, useEffect, useMemo } from 'react'
import {
    getFallbackBasemap,
    defaultBasemaps,
} from '../../constants/basemaps.js'
import { fetchLayer } from '../../loaders/layers.js'
import { createExternalLayer } from '../../util/external.js'
// import { getConfigFromNonMapConfig } from '../../util/getConfigFromNonMapConfig.js'
import { getMigratedMapConfig } from '../../util/getMigratedMapConfig.js'
import { fetchExternalLayers } from '../../util/requests.js'
import LoadingMask from '../LoadingMask.js'
import { useSystemSettings } from '../SystemSettingsProvider.js'
import OldPlugin from './Plugin.js'

async function getBasemaps(basemapId, defaultBasemapId, engine) {
    try {
        let externalBasemaps = []
        if (isValidUid(basemapId) || isValidUid(defaultBasemapId)) {
            const externalLayers = await fetchExternalLayers(engine)
            externalBasemaps = externalLayers
                .filter((layer) => layer.mapLayerPosition === 'BASEMAP')
                .map(createExternalLayer)
        }

        return defaultBasemaps().concat(externalBasemaps)
    } catch (e) {
        return defaultBasemaps()
    }
}

async function getConfig({
    mapViews,
    basemapId,
    keyDefaultBaseMap,
    keyBingMapsApiKey,
    engine,
}) {
    const fetchedMapViews = await Promise.all(mapViews.map(fetchLayer))
    const basemaps = await getBasemaps(basemapId, keyDefaultBaseMap, engine)

    const basemap =
        basemaps.find(({ id }) => id === basemapId) ||
        basemaps.find(({ id }) => id === keyDefaultBaseMap) ||
        getFallbackBasemap()

    if (basemap.id.substring(0, 4) === 'bing') {
        basemap.config.apiKey = keyBingMapsApiKey
    }
    return {
        fetchedMapViews,
        basemap,
    }
}

const Plugin = ({ visualization }) => {
    const {
        basemap: basemapId,
        mapViews,
        userOrgUnit,
        ...otherMapProps
    } = visualization
    const engine = useDataEngine()
    const { keyBingMapsApiKey, keyDefaultBaseMap } = useSystemSettings()
    const [config, setConfig] = useState(null)

    const mapConfig = useMemo(() => {
        return getMigratedMapConfig({ basemapId, mapViews }, keyDefaultBaseMap)
    }, [basemapId, mapViews, keyDefaultBaseMap])

    useEffect(() => {
        const fetchLayers = async () => {
            const { fetchedMapViews, basemap } = await getConfig({
                mapViews: userOrgUnit
                    ? mapConfig.mapViews?.map((v) => ({
                          ...v,
                          userOrgUnit,
                      }))
                    : mapConfig.mapViews,
                basemapId,
                keyDefaultBaseMap,
                keyBingMapsApiKey,
                engine,
            })

            setConfig({
                ...mapConfig,
                mapViews: fetchedMapViews,
                basemap,
            })
        }

        if (mapConfig.mapViews) {
            fetchLayers()
        }
    }, [
        basemapId,
        engine,
        mapConfig,
        keyBingMapsApiKey,
        keyDefaultBaseMap,
        userOrgUnit,
    ])

    return !config ? (
        <LoadingMask />
    ) : (
        <OldPlugin {...config} {...otherMapProps} />
    )
}

Plugin.propTypes = {
    visualization: PropTypes.object,
}

export default Plugin

// async function loadMap(config) {
// if (config.id) {
//     mapRequest(config.id, keyDefaultBaseMap).then((favorite) =>
//         loadLayers({
//             ...config,
//             ...favorite,
//         })
//     )
// } else if (!config.mapViews) {
//     getConfigFromNonMapConfig(config, keyDefaultBaseMap).then(
//         (config) => loadLayers(config)
//     )
// } else {
//     loadLayers(getMigratedMapConfig(config, keyDefaultBaseMap))
// }
// }
