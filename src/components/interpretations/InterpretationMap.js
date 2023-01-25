import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
// import { fetchLayer } from '../../loaders/layers.js'
import { getPeriodFromFilters } from '../../util/analytics.js'
import { getRelativePeriods } from '../../util/periods.js'
import Plugin from '../plugin/Plugin.js'
import styles from './styles/InterpretationMap.module.css'

const InterpretationMap = ({ visualization, filters, onResponsesReceived }) => {
    const [mapViews, setMapViews] = useState()

    useEffect(() => {
        // Find layers with relative periods
        const relativePeriodLayers = visualization.mapViews
            .filter((config) => {
                const period = getPeriodFromFilters(config.filters)
                return (
                    period &&
                    getRelativePeriods().find((p) => p.id === period.id)
                )
            })
            .map((layer) => ({
                ...layer,
                ...filters, // includes relativePeriodDate
                isLoaded: false,
            }))

        if (relativePeriodLayers.length) {
            // Refetch all relative period layers using the relativePeriodDate date
            // Promise.all(relativePeriodLayers.map(fetchLayer)).then(
            // (mapViews) => {
            // Replace layers fetched and update state
            setMapViews(
                visualization.mapViews.map(
                    (layer) =>
                        relativePeriodLayers.find(
                            (relativeLayer) => relativeLayer.id === layer.id
                        ) || layer
                )
            )
            // }
            // )
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
            <Plugin {...visualization} mapViews={mapViews} />
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
