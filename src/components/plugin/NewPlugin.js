import { useDataEngine } from '@dhis2/app-runtime'
// import { useD2 } from '@dhis2/app-runtime-adapter-d2'
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

// const defaultBounds = [
//     [-18.7, -34.9],
//     [50.2, 35.9],
// ]

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

const Plugin = ({ visualization }) => {
    const {
        basemap: basemapId,
        controls,
        hideTitle,
        mapViews,
        // userOrgUnit,
        name,
    } = visualization
    const engine = useDataEngine()
    // const { d2 } = useD2()
    const { keyBingMapsApiKey, keyDefaultBaseMap } = useSystemSettings()
    const [config, setConfig] = useState(null)
    const [basemaps, setBasemaps] = useState(null)

    const mapConfig = useMemo(() => {
        return getMigratedMapConfig({ basemapId, mapViews }, keyDefaultBaseMap)
    }, [basemapId, mapViews, keyDefaultBaseMap])

    useEffect(() => {
        const getAllBasemaps = async () => {
            const bm = await getBasemaps(basemapId, keyDefaultBaseMap, engine)
            setBasemaps(bm)
        }

        getAllBasemaps()
    }, [basemapId, keyDefaultBaseMap, engine])

    useEffect(() => {
        if (!basemaps) {
            return
        }

        const basemapToUse =
            basemaps.find(({ id }) => id === basemapId) ||
            basemaps.find(({ id }) => id === keyDefaultBaseMap) ||
            getFallbackBasemap()

        if (basemapToUse.id.substring(0, 4) === 'bing') {
            basemapToUse.config.apiKey = keyBingMapsApiKey
        }

        const fetchLayers = async () => {
            const fetchedMapViews = await Promise.all(mapViews.map(fetchLayer))

            setConfig({
                ...mapConfig,
                controls,
                hideTitle,
                name,
                mapViews: fetchedMapViews,
                basemap: basemapToUse,
            })
        }

        if (mapViews) {
            // if (userOrgUnit) {
            //     mapViews = mapViews.map((mapView) => ({
            //         ...mapView,
            //         userOrgUnit,
            //     }))
            // }

            fetchLayers()
        }
    }, [
        basemapId,
        basemaps,
        mapConfig,
        controls,
        hideTitle,
        keyBingMapsApiKey,
        keyDefaultBaseMap,
        mapViews,
        name,
    ])

    if (!config) {
        return <LoadingMask />
    }

    return <OldPlugin {...config} />
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
