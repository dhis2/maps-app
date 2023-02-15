import { useDataEngine } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import React, { useState, useEffect, useMemo } from 'react'
// import { getConfigFromNonMapConfig } from '../../util/getConfigFromNonMapConfig.js'
import { getMigratedMapConfig } from '../../util/getMigratedMapConfig.js'
import LoadingMask from '../LoadingMask.js'
import { useSystemSettings } from '../SystemSettingsProvider.js'
import OldPlugin from './Plugin.js'
import { getConfig } from './pluginUtils.js'

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
