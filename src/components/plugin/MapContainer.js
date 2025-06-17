import { useDataEngine } from '@dhis2/app-runtime'
import isEmpty from 'lodash/isEmpty'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import { getConfigFromNonMapConfig } from '../../util/getConfigFromNonMapConfig.js'
import { getMigratedMapConfig } from '../../util/getMigratedMapConfig.js'
import { fetchMap } from '../../util/requests.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.js'
import getBasemapConfig from './getBasemapConfig.js'
import LoadingMask from './LoadingMask.js'
import Map from './Map.js'

const MapContainer = ({ visualization }) => {
    const engine = useDataEngine()
    const { systemSettings } = useCachedData()
    const [config, setConfig] = useState(null)

    useEffect(() => {
        const {
            basemap: visBasemap,
            mapViews,
            id,
            ...otherMapProps
        } = visualization

        const prepareConfig = async () => {
            const { keyBingMapsApiKey, keyDefaultBaseMap } = systemSettings
            let initialConfig
            if (id && !mapViews) {
                const map = await fetchMap({
                    id,
                    engine,
                    defaultBasemap: keyDefaultBaseMap,
                })
                initialConfig = getMigratedMapConfig(map, keyDefaultBaseMap)
            } else if (!mapViews) {
                initialConfig = await getConfigFromNonMapConfig(
                    otherMapProps,
                    keyDefaultBaseMap,
                    engine
                )
            } else {
                initialConfig = getMigratedMapConfig(
                    { basemap: visBasemap, mapViews },
                    keyDefaultBaseMap
                )
            }

            const { basemap } = await getBasemapConfig({
                basemapId: initialConfig.basemap?.id,
                basemapVisible: initialConfig.basemap?.isVisible,
                keyDefaultBaseMap,
                keyBingMapsApiKey,
                engine,
            })

            setConfig({
                ...initialConfig,
                basemap,
            })
        }

        if (!isEmpty(systemSettings)) {
            prepareConfig()
        }
    }, [visualization, systemSettings, engine])

    // eslint-disable-next-line no-unused-vars
    const { basemap, mapViews, id, ...rest } = visualization

    return !config ? <LoadingMask /> : <Map {...config} {...rest} />
}

MapContainer.propTypes = {
    visualization: PropTypes.object,
}

export default MapContainer
