import { useConfig } from '@dhis2/app-runtime'
import { useAlert } from '@dhis2/app-service-alerts'
import { useSetting } from '@dhis2/app-service-datastore'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { connect } from 'react-redux'
import { clearDataFilters } from '../../../actions/dataFilters.js'
import { toggleDataTable } from '../../../actions/dataTable.js'
import {
    editLayer,
    removeLayer,
    duplicateLayer,
    changeLayerOpacity,
    toggleLayerExpand,
    toggleLayerVisibility,
} from '../../../actions/layers.js'
import {
    ALERT_SUCCESS,
    ALERT_MESSAGE_DYNAMIC,
    ERROR_CRITICAL,
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
import Legend from '../../legend/Legend.jsx'
import LegendAlert from '../../legend/LegendAlert.jsx'
import DataDownloadDialog from '../download/DataDownloadDialog.jsx'
import LayerCard from '../LayerCard.jsx'
import styles from './styles/OverlayCard.module.css'

const getCardContent = ({ loadError, legend }) => {
    if (loadError) {
        return (
            <div data-test="load-error-noticebox" className={styles.loadError}>
                <LegendAlert
                    alert={{ code: ERROR_CRITICAL, message: loadError }}
                />
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

const getOpenAsHandler = (layer, baseUrl, setCurrentAO) => async (type) => {
    const currentAO = getAnalyticalObjectFromThematicLayer(layer)

    // Store AO in user data store
    await setCurrentAO(currentAO)

    // Open it in another app
    window.open(
        `${baseUrl}/${APP_URLS[type]}/#/currentAnalyticalObject`,
        '_blank'
    )
}

const getTitle = (isLoaded, name) =>
    isLoaded ? name : i18n.t('Loading layer') + '...'

const getSubtitle = (isLoaded, legend) =>
    isLoaded && legend?.period ? legend.period : null

const ifAllowed = (allowed, handler) => (allowed ? handler : undefined)

const OverlayCard = ({
    layer,
    editLayer,
    removeLayer,
    duplicateLayer,
    changeLayerOpacity,
    toggleLayerExpand,
    toggleLayerVisibility,
    toggleDataTable,
    clearDataFilters,
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
        dataFilters,
    } = layer

    const canEdit = layerType !== EXTERNAL_LAYER
    const canToggleDataTable = DATA_TABLE_LAYER_TYPES.includes(layerType)
    const canDownload = DOWNLOADABLE_LAYER_TYPES.includes(layerType)
    const canOpenAs = OPEN_AS_LAYER_TYPES.includes(layerType)
    const hasDataFilters = Object.keys(dataFilters ?? {}).length > 0

    return (
        <>
            <LayerCard
                layer={layer}
                title={getTitle(isLoaded, name)}
                subtitle={getSubtitle(isLoaded, legend)}
                opacity={opacity}
                isOverlay={true}
                isExpanded={isExpanded}
                isVisible={isVisible}
                toggleExpand={() => toggleLayerExpand(id)}
                onEdit={ifAllowed(canEdit, () => editLayer(layer))}
                toggleDataTable={ifAllowed(canToggleDataTable, () =>
                    toggleDataTable(id)
                )}
                onClearDataFilters={ifAllowed(hasDataFilters, () =>
                    clearDataFilters(id)
                )}
                toggleLayerVisibility={() => toggleLayerVisibility(id)}
                onOpacityChange={(newOpacity) =>
                    changeLayerOpacity(id, newOpacity)
                }
                onDuplicate={() => duplicateLayer(id)}
                onRemove={() => {
                    removeLayer(id, layer.combinedLayerKey)
                    layerRemovedAlert.show({
                        msg: i18n.t('{{- name}} deleted.', { name }),
                    })
                }}
                downloadData={ifAllowed(canDownload, () =>
                    setShowDataDownloadDialog(true)
                )}
                openAs={ifAllowed(
                    canOpenAs,
                    getOpenAsHandler(layer, baseUrl, set)
                )}
                hasError={!!loadError}
            >
                {getCardContent({ loadError, legend })}
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
    clearDataFilters: PropTypes.func.isRequired,
    duplicateLayer: PropTypes.func.isRequired,
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
    duplicateLayer,
    changeLayerOpacity,
    clearDataFilters,
    toggleLayerExpand,
    toggleLayerVisibility,
    toggleDataTable,
})(OverlayCard)
