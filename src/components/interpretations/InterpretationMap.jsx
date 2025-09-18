import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import useBasemapConfig from '../../hooks/useBasemapConfig.js'
import { getPeriodsFromFilters } from '../../util/analytics.js'
import { getRelativePeriods } from '../../util/periods.js'
import Map from '../plugin/Map.jsx'
import styles from './styles/InterpretationMap.module.css'

const InterpretationMap = ({ visualization, filters, onResponsesReceived }) => {
    const [mapViews, setMapViews] = useState()
    const basemapConfig = useBasemapConfig(visualization.basemap)

    useEffect(() => {
        // Find layers with relative periods
        const relativePeriodLayers = visualization.mapViews
            .filter((config) => {
                const periods = getPeriodsFromFilters(config.filters)
                return (
                    periods &&
                    periods.some((period) =>
                        getRelativePeriods().some((p) => p.id === period.id)
                    )
                )
            })
            .map((layer) => ({
                ...layer,
                ...filters, // includes relativePeriodDate
                isLoaded: false,
            }))

        if (relativePeriodLayers.length) {
            // Replace relative period layers and update state
            setMapViews(
                visualization.mapViews.map(
                    (layer) =>
                        relativePeriodLayers.find(
                            (relativeLayer) => relativeLayer.id === layer.id
                        ) || layer
                )
            )
        } else {
            setMapViews(visualization.mapViews)
        }
    }, [visualization, filters])

    useEffect(() => {
        if (mapViews) {
            onResponsesReceived()
        }
    }, [mapViews, onResponsesReceived])

    return mapViews ? (
        <div className={styles.map}>
            <Map
                {...visualization}
                basemap={basemapConfig}
                mapViews={mapViews}
            />
        </div>
    ) : null
}

InterpretationMap.propTypes = {
    visualization: PropTypes.object.isRequired,
    onResponsesReceived: PropTypes.func.isRequired,
    className: PropTypes.string,
    filters: PropTypes.shape({
        relativePeriodDate: PropTypes.string.isRequired,
    }),
}

export default InterpretationMap
