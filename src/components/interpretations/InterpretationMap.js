import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Plugin from '../plugin/Plugin';
import { getPeriodFromFilters } from '../../util/analytics';
import { getRelativePeriods } from '../../util/periods';
import { fetchLayer } from '../../loaders/layers';
import styles from './styles/InterpretationMap.module.css';

const InterpretationMap = ({
    visualization,
    filters,
    onResponsesReceived,
    // className,
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [mapViews, setMapViews] = useState();

    useEffect(() => {
        const relativePeriodLayers = visualization.mapViews
            .filter(config => {
                const period = getPeriodFromFilters(config.filters);
                return (
                    period && getRelativePeriods().find(p => p.id === period.id)
                );
            })
            .map(layer => ({ ...layer, ...filters }));

        if (relativePeriodLayers.length) {
            Promise.all(relativePeriodLayers.map(fetchLayer)).then(mapViews => {
                setMapViews(mapViews);
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, [visualization, filters]);

    useEffect(() => {
        if (isLoading === false) {
            onResponsesReceived();
        }
    }, [isLoading, onResponsesReceived]);

    return isLoading === false ? (
        <div className={styles.plugin}>
            <Plugin
                {...visualization}
                mapViews={mapViews || visualization.mapViews}
            />
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
