import { useConfig } from '@dhis2/app-runtime'
import { useAlert } from '@dhis2/app-service-alerts'
import { useSetting } from '@dhis2/app-service-datastore'
import i18n from '@dhis2/d2-i18n'
import { NoticeBox } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { connect } from 'react-redux'
import { toggleDataTable } from '../../../actions/dataTable.js'
import {
    editLayer,
    removeLayer,
    changeLayerOpacity,
    toggleLayerExpand,
    toggleLayerVisibility,
} from '../../../actions/layers.js'
import {
    ALERT_SUCCESS,
    ALERT_MESSAGE_DYNAMIC,
} from '../../../constants/alerts.js'
import {
    DOWNLOADABLE_LAYER_TYPES,
    DATA_TABLE_LAYER_TYPES,
    OPEN_AS_LAYER_TYPES,
    EXTERNAL_LAYER,
} from '../../../constants/layers.js'
import {
    getAnalyticalObjectFromThematicLayer,
    APP_URLS,
    CURRENT_AO_KEY,
} from '../../../util/analyticalObject.js'
import Legend from '../../legend/Legend.js'
import DataDownloadDialog from '../download/DataDownloadDialog.js'
import LayerCard from '../LayerCard.js'
import styles from './styles/OverlayCard.module.css'

const OverlayCard = ({
    layer,
    editLayer,
    removeLayer,
    changeLayerOpacity,
    toggleLayerExpand,
    toggleLayerVisibility,
    toggleDataTable,
}) => {
    const [showDataDownloadDialog, setShowDataDownloadDialog] = useState(false)
    const { baseUrl } = useConfig()
    const [, /* actual value not used */ { set }] = useSetting(CURRENT_AO_KEY)
    const layerRemovedAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_SUCCESS)

    const {
        id,
        name,
        legend,
        isExpanded = true,
        opacity,
        isVisible,
        layer: layerType,
        isLoaded,
        loadError,
    } = layer

    const canEdit = layerType !== EXTERNAL_LAYER
    const canToggleDataTable = DATA_TABLE_LAYER_TYPES.includes(layerType)
    const canDownload = DOWNLOADABLE_LAYER_TYPES.includes(layerType)
    const canOpenAs = OPEN_AS_LAYER_TYPES.includes(layerType)

    const getCardContent = () => {
        if (loadError) {
            return (
                <div
                    data-test="load-error-noticebox"
                    className={styles.noticebox}
                >
                    <NoticeBox error title={i18n.t('Failed to load layer')}>
                        <p>{loadError}</p>
                    </NoticeBox>
                </div>
            )
        }
        return (
            legend && (
                <div className={styles.legend}>
                    <Legend {...legend} />
                </div>
            )
        )
    }

    return (
        <>
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
                onOpacityChange={(newOpacity) =>
                    changeLayerOpacity(id, newOpacity)
                }
                onRemove={() => {
                    removeLayer(id)
                    layerRemovedAlert.show({
                        msg: i18n.t('{{name}} deleted.', { name }),
                    })
                }}
                downloadData={
                    canDownload
                        ? () => setShowDataDownloadDialog(true)
                        : undefined
                }
                openAs={
                    canOpenAs
                        ? async (type) => {
                              const currentAO =
                                  getAnalyticalObjectFromThematicLayer(layer)

                              // Store AO in user data store
                              await set(currentAO)

                              // Open it in another app
                              window.location.href = `${baseUrl}/${APP_URLS[type]}/#/currentAnalyticalObject`
                          }
                        : undefined
                }
                hasError={!!loadError}
            >
                {getCardContent()}
            </LayerCard>
            {showDataDownloadDialog && (
                <DataDownloadDialog
                    layer={layer}
                    onCloseDialog={() => setShowDataDownloadDialog(false)}
                />
            )}
        </>
    )
}

OverlayCard.propTypes = {
    changeLayerOpacity: PropTypes.func.isRequired,
    editLayer: PropTypes.func.isRequired,
    layer: PropTypes.object.isRequired,
    removeLayer: PropTypes.func.isRequired,
    toggleDataTable: PropTypes.func.isRequired,
    toggleLayerExpand: PropTypes.func.isRequired,
    toggleLayerVisibility: PropTypes.func.isRequired,
}

export default connect(null, {
    editLayer,
    removeLayer,
    changeLayerOpacity,
    toggleLayerExpand,
    toggleLayerVisibility,
    toggleDataTable,
})(OverlayCard)
