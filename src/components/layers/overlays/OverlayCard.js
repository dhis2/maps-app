import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { useConfig } from '@dhis2/app-runtime';
import { useSetting } from '@dhis2/app-service-datastore';
import LayerCard from '../LayerCard';
import Legend from '../../legend/Legend';
import {
    editLayer,
    removeLayer,
    changeLayerOpacity,
    toggleLayerExpand,
    toggleLayerVisibility,
} from '../../../actions/layers';
import { setAlert } from '../../../actions/alerts';
import { toggleDataTable } from '../../../actions/dataTable';
import { openDataDownloadDialog } from '../../../actions/dataDownload';
import {
    getAnalyticalObjectFromThematicLayer,
    APP_URLS,
    CURRENT_AO_KEY,
} from '../../../util/analyticalObject';
import {
    DOWNLOADABLE_LAYER_TYPES,
    DATA_TABLE_LAYER_TYPES,
    OPEN_AS_LAYER_TYPES,
    EXTERNAL_LAYER,
} from '../../../constants/layers';

import styles from './styles/OverlayCard.module.css';

const OverlayCard = ({
    layer,
    editLayer,
    removeLayer,
    changeLayerOpacity,
    toggleLayerExpand,
    toggleLayerVisibility,
    toggleDataTable,
    openDataDownloadDialog,
    setAlert,
}) => {
    const { baseUrl } = useConfig();
    const [, /* actual value not used */ { set }] = useSetting(CURRENT_AO_KEY);

    const {
        id,
        name,
        legend,
        isExpanded = true,
        opacity,
        isVisible,
        layer: layerType,
        isLoaded,
    } = layer;

    const canEdit = layerType !== EXTERNAL_LAYER;
    const canToggleDataTable = DATA_TABLE_LAYER_TYPES.includes(layerType);
    const canDownload = DOWNLOADABLE_LAYER_TYPES.includes(layerType);
    const canOpenAs = OPEN_AS_LAYER_TYPES.includes(layerType);

    return (
        <LayerCard
            layer={layer}
            title={isLoaded ? name : i18n.t('Loading layer') + '...'}
            subtitle={
                isLoaded && legend && legend.period ? legend.period : null
            }
            opacity={opacity}
            isOverlay={true}
            isExpanded={isExpanded}
            isVisible={isVisible}
            toggleExpand={() => toggleLayerExpand(id)}
            onEdit={canEdit ? () => editLayer(layer) : undefined}
            toggleDataTable={
                canToggleDataTable ? () => toggleDataTable(id) : undefined
            }
            toggleLayerVisibility={() => toggleLayerVisibility(id)}
            onOpacityChange={newOpacity => changeLayerOpacity(id, newOpacity)}
            onRemove={() => {
                removeLayer(id);
                setAlert({
                    success: true,
                    message: i18n.t('{{name}} deleted.', { name }),
                });
            }}
            downloadData={
                canDownload ? () => openDataDownloadDialog(id) : undefined
            }
            openAs={
                canOpenAs
                    ? async type => {
                          const currentAO = getAnalyticalObjectFromThematicLayer(
                              layer
                          );

                          // Store AO in user data store
                          await set(currentAO);

                          // Open it in another app
                          window.open(
                              `${baseUrl}/${APP_URLS[type]}/#/currentAnalyticalObject`,
                              '_blank'
                          );
                      }
                    : undefined
            }
        >
            {legend && (
                <div className={styles.legend}>
                    <Legend {...legend} />
                </div>
            )}
        </LayerCard>
    );
};

OverlayCard.propTypes = {
    layer: PropTypes.object.isRequired,
    editLayer: PropTypes.func.isRequired,
    removeLayer: PropTypes.func.isRequired,
    changeLayerOpacity: PropTypes.func.isRequired,
    openDataDownloadDialog: PropTypes.func.isRequired,
    setAlert: PropTypes.func.isRequired,
    toggleLayerExpand: PropTypes.func.isRequired,
    toggleLayerVisibility: PropTypes.func.isRequired,
    toggleDataTable: PropTypes.func.isRequired,
};

export default connect(null, {
    editLayer,
    removeLayer,
    changeLayerOpacity,
    toggleLayerExpand,
    toggleLayerVisibility,
    toggleDataTable,
    setAlert,
    openDataDownloadDialog,
})(OverlayCard);
