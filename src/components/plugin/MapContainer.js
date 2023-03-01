import { useDataEngine } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import React, { useState, useEffect, useMemo } from 'react'
import { getConfigFromNonMapConfig } from '../../util/getConfigFromNonMapConfig.js'
import { getMigratedMapConfig } from '../../util/getMigratedMapConfig.js'
import { mapFields } from '../../util/helpers.js'
import LoadingMask from '../LoadingMask.js'
import { useSystemSettings } from '../SystemSettingsProvider.js'
import getBasemapConfig from './getBasemapConfig.js'
import Map from './Map.js'

const MapContainer = ({ visualization }) => {
    const {
        basemap: basemapId,
        mapViews,
        userOrgUnit,
        id,
        ...otherMapProps
    } = visualization
    const engine = useDataEngine()
    const { keyBingMapsApiKey, keyDefaultBaseMap } = useSystemSettings()
    const [config, setConfig] = useState(null)

    const mapConfig = useMemo(() => {
        if (id) {
            //        mapRequest(config.id, keyDefaultBaseMap).then((favorite) =>
            //             loadLayers({
            //                 ...config,
            //                 ...favorite,
            //             })
            //         )
            // return d2.models.map
            //     .get(id, {
            //         fields: mapFields(),
            //     })
            //     .then((map) => getMigratedMapConfig(map, keyDefaultBaseMap))
        } else if (!mapViews) {
            return getConfigFromNonMapConfig(otherMapProps, keyDefaultBaseMap)
        }

        return getMigratedMapConfig({ basemapId, mapViews }, keyDefaultBaseMap)
    }, [id, otherMapProps, basemapId, mapViews, keyDefaultBaseMap])

    // async function loadMap(config) {
    //     if (config.id) {
    //         mapRequest(config.id, keyDefaultBaseMap).then((favorite) =>
    //             loadLayers({
    //                 ...config,
    //                 ...favorite,
    //             })
    //         )
    //     } else if (!config.mapViews) {
    //         getConfigFromNonMapConfig(config, keyDefaultBaseMap).then(
    //             (config) => loadLayers(config)
    //         )
    //     }
    // }

    useEffect(() => {
        const prepareConfig = async () => {
            const { basemap } = await getBasemapConfig({
                basemapId,
                keyDefaultBaseMap,
                keyBingMapsApiKey,
                engine,
            })

            setConfig({
                ...mapConfig,
                mapViews: userOrgUnit
                    ? mapConfig.mapViews?.map((v) => ({
                          ...v,
                          userOrgUnit,
                      }))
                    : mapConfig.mapViews,
                basemap,
            })
        }

        if (mapConfig.mapViews) {
            prepareConfig()
        }
    }, [
        basemapId,
        engine,
        mapConfig,
        keyBingMapsApiKey,
        keyDefaultBaseMap,
        userOrgUnit,
    ])

    return !config ? <LoadingMask /> : <Map {...config} {...otherMapProps} />
}

MapContainer.propTypes = {
    visualization: PropTypes.object,
}

export default MapContainer
