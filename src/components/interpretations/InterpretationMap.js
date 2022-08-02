import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Plugin from '../plugin/Plugin';
import { getPeriodFromFilters } from '../../util/analytics';
import { getRelativePeriods } from '../../util/periods';
import { fetchLayer } from '../../loaders/layers';
import styles from './styles/InterpretationMap.module.css';

const InterpretationMap = ({ visualization, filters, onResponsesReceived }) => {
    const [mapViews, setMapViews] = useState();

    useEffect(() => {
        const relativePeriodLayers = visualization.mapViews
            .filter(config => {
                const period = getPeriodFromFilters(config.filters);
                return (
                    period && getRelativePeriods().find(p => p.id === period.id)
                );
            })
            .map(layer => ({
                ...layer,
                ...filters,
                // relativePeriodDate: '2022-05-01T17:45:58.166',
            }));

        if (relativePeriodLayers.length) {
            Promise.all(relativePeriodLayers.map(fetchLayer)).then(mapViews => {
                setMapViews(
                    visualization.mapViews.map(
                        layer =>
                            mapViews.find(
                                relativeLayer => relativeLayer.id === layer.id
                            ) || layer
                    )
                );
            });
        } else {
            setMapViews(visualization.mapViews);
        }
    }, [visualization, filters]);

    useEffect(() => {
        if (mapViews) {
            onResponsesReceived();
        }
    }, [mapViews, onResponsesReceived]);

    return mapViews ? (
        <div className={styles.map}>
            <Plugin {...visualization} mapViews={mapViews} />
        </div>
    ) : null;
};

InterpretationMap.propTypes = {
    visualization: PropTypes.object.isRequired,
    filters: PropTypes.object,
    onResponsesReceived: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export default InterpretationMap;
