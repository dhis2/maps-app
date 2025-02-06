import { useCachedDataQuery } from '@dhis2/analytics'
import { useDataEngine } from '@dhis2/app-runtime'
import isEmpty from 'lodash/isEmpty'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import { getConfigFromNonMapConfig } from '../../util/getConfigFromNonMapConfig.js'
import { getMigratedMapConfig } from '../../util/getMigratedMapConfig.js'
import { fetchMap } from '../../util/requests.js'
import getBasemapConfig from './getBasemapConfig.js'
import LoadingMask from './LoadingMask.jsx'
import Map from './Map.jsx'

const MapContainer = ({ visualization }) => {
    const engine = useDataEngine()
    const { systemSettings } = useCachedDataQuery()
    const [config, setConfig] = useState(null)

    useEffect(() => {
        const {
            basemap: visBasemap,
            mapViews,
            userOrgUnit,
            id,
            ...otherMapProps
        } = visualization

        const prepareConfig = async () => {
            const { keyBingMapsApiKey, keyDefaultBaseMap } = systemSettings
            let initialConfig
            if (id && !mapViews) {
                const map = await fetchMap(id, engine, keyDefaultBaseMap)
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
                mapViews: userOrgUnit
                    ? initialConfig.mapViews?.map((v) => ({
                          ...v,
                          userOrgUnit,
                      }))
                    : initialConfig.mapViews,
                basemap,
            })
        }

        if (!isEmpty(systemSettings)) {
            prepareConfig()
        }
    }, [visualization, systemSettings, engine])

    // eslint-disable-next-line no-unused-vars
    const { basemap, mapViews, userOrgUnit, id, ...rest } = visualization

    return !config ? <LoadingMask /> : <Map {...config} {...rest} />
}

MapContainer.propTypes = {
    visualization: PropTypes.object,
}

export default MapContainer
