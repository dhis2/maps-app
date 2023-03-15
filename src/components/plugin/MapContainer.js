import { useDataEngine } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import { getConfigFromNonMapConfig } from '../../util/getConfigFromNonMapConfig.js'
import { getMigratedMapConfig } from '../../util/getMigratedMapConfig.js'
import { fetchMap } from '../../util/requests.js'
import { useSystemSettings } from '../SystemSettingsProvider.js'
import getBasemapConfig from './getBasemapConfig.js'
import LoadingMask from './LoadingMask.js'
import Map from './Map.js'

const MapContainer = ({ visualization }) => {
    const engine = useDataEngine()
    const { keyBingMapsApiKey, keyDefaultBaseMap } = useSystemSettings()
    const [config, setConfig] = useState(null)

    useEffect(() => {
        const {
            basemap: basemapId,
            mapViews,
            userOrgUnit,
            id,
            ...otherMapProps
        } = visualization

        const prepareConfig = async () => {
            console.log('prepareConfig')

            let initialConfig
            if (id) {
                const map = await fetchMap(id, engine, keyDefaultBaseMap)
                initialConfig = getMigratedMapConfig(map, keyDefaultBaseMap)
            } else if (!mapViews) {
                initialConfig = await getConfigFromNonMapConfig(
                    otherMapProps,
                    keyDefaultBaseMap
                )
            } else {
                initialConfig = getMigratedMapConfig(
                    { basemapId, mapViews },
                    keyDefaultBaseMap
                )
            }

            const { basemap } = await getBasemapConfig({
                basemapId,
                keyDefaultBaseMap,
                keyBingMapsApiKey,
                engine,
            })

            setConfig({
                ...initialConfig,
                mapViews: userOrgUnit
                    ? initialConfig.mapViews?.map((v) => ({
                          ...v,
                          userOrgUnit,
                      }))
                    : initialConfig.mapViews,
                basemap,
            })
        }

        // Wait for keyDefaultBaseMap before prepare config
        if (keyDefaultBaseMap) {
            prepareConfig()
        }
    }, [visualization, keyBingMapsApiKey, keyDefaultBaseMap, engine])

    // eslint-disable-next-line no-unused-vars
    const { basemap, mapViews, userOrgUnit, id, ...rest } = visualization

    return !config ? <LoadingMask /> : <Map {...config} {...rest} />
}

MapContainer.propTypes = {
    visualization: PropTypes.object,
}

export default MapContainer
