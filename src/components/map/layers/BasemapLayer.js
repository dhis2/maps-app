import { useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import log from 'loglevel';
import { useAlert } from '@dhis2/app-service-alerts';
import i18n from '@dhis2/d2-i18n';
import {
    ALERT_CRITICAL,
    ALERT_MESSAGE_DYNAMIC,
} from '../../../constants/alerts';

const BASEMAP_LAYER_INDEX = 0;

const getAlertError = message => {
    return {
        msg: i18n.t('Basemap could not be added: {{message}}', {
            message,
            nsSeparator: ';',
        }),
    };
};

const BasemapLayer = (
    { id, config, opacity, isVisible },
    { map, isPlugin }
) => {
    const basemapNotFoundAlert = useAlert(
        ALERT_MESSAGE_DYNAMIC,
        ALERT_CRITICAL
    );
    const basemapInvalidAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_CRITICAL);
    const basemap = useMemo(
        () =>
            map.createLayer({
                ...config,
                id,
                index: BASEMAP_LAYER_INDEX,
            }),
        [map, id, config]
    );

    useEffect(() => {
        map.addLayer(basemap).catch(errorMessage => {
            log.error(`Basemap could not be added: ${errorMessage}`);
            if (!isPlugin) {
                const alertError = getAlertError(errorMessage);
                if (errorMessage.includes('not found')) {
                    basemapNotFoundAlert.show(alertError);
                } else {
                    basemapInvalidAlert.show(alertError);
                }
            }
        });
        return () => map.removeLayer(basemap);
    }, [map, basemap]);

    useEffect(() => {
        basemap.setOpacity(opacity);
    }, [basemap, opacity]);

    useEffect(() => {
        basemap.setVisibility(isVisible);
    }, [basemap, isVisible]);

    return null;
};

BasemapLayer.contextTypes = { map: PropTypes.object };

BasemapLayer.propTypes = {
    config: PropTypes.object,
    id: PropTypes.string,
    isVisible: PropTypes.bool,
    opacity: PropTypes.number,
};

BasemapLayer.defaultProps = {
    opacity: 1,
    isVisible: true,
};

export default BasemapLayer;
