import { useConfig } from '@dhis2/app-runtime'
import { useAlert } from '@dhis2/app-service-alerts'
import { useSetting } from '@dhis2/app-service-datastore'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { connect } from 'react-redux'
import {
    setDataFilter,
    clearDataFilter,
} from '../../../actions/dataFilters.js'
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
    THEMATIC_LAYER,
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

const OverlayCard = ({
    layer,
    editLayer,
    removeLayer,
    duplicateLayer,
    changeLayerOpacity,
    toggleLayerExpand,
    toggleLayerVisibility,
    toggleDataTable,
    setDataFilter,
    clearDataFilter,
    activeDataTableLayerId,
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
    const canFilterByLegend = layerType === THEMATIC_LAYER

    const onLegendItemClick = (item) => {
        if (!item?.name) {
            return
        }
        const currentLegendFilter = Array.isArray(dataFilters?.legend)
            ? dataFilters.legend
            : []
        const isActive = currentLegendFilter.includes(item.name)
        const nextLegendFilter = isActive
            ? currentLegendFilter.filter((n) => n !== item.name)
            : [...currentLegendFilter, item.name]

        if (nextLegendFilter.length) {
            setDataFilter(id, 'legend', nextLegendFilter)
        } else {
            clearDataFilter(id, 'legend')
        }

        if (activeDataTableLayerId !== id) {
            toggleDataTable(id)
        }
    }

    const getCardContent = () => {
        if (loadError) {
            return (
                <div
                    data-test="load-error-noticebox"
                    className={styles.loadError}
                >
                    <LegendAlert
                        alert={{ code: ERROR_CRITICAL, message: loadError }}
                    />
                </div>
            )
        }
        return (
            legend && (
                <div className={styles.legend}>
                    <Legend
                        {...legend}
                        onItemClick={
                            canFilterByLegend ? onLegendItemClick : undefined
                        }
                        activeLegendNames={
                            canFilterByLegend &&
                            Array.isArray(dataFilters?.legend)
                                ? dataFilters.legend
                                : undefined
                        }
                    />
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
                onDuplicate={() => duplicateLayer(id)}
                onRemove={() => {
                    removeLayer(id)
                    layerRemovedAlert.show({
                        msg: i18n.t('{{- name}} deleted.', { name }),
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
                              window.open(
                                  `${baseUrl}/${APP_URLS[type]}/#/currentAnalyticalObject`,
                                  '_blank'
                              )
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
    clearDataFilter: PropTypes.func.isRequired,
    duplicateLayer: PropTypes.func.isRequired,
    editLayer: PropTypes.func.isRequired,
    layer: PropTypes.object.isRequired,
    removeLayer: PropTypes.func.isRequired,
    setDataFilter: PropTypes.func.isRequired,
    toggleDataTable: PropTypes.func.isRequired,
    toggleLayerExpand: PropTypes.func.isRequired,
    toggleLayerVisibility: PropTypes.func.isRequired,
    activeDataTableLayerId: PropTypes.string,
}

const mapStateToProps = (state) => ({
    activeDataTableLayerId: state.dataTable,
})

export default connect(mapStateToProps, {
    editLayer,
    removeLayer,
    duplicateLayer,
    changeLayerOpacity,
    toggleLayerExpand,
    toggleLayerVisibility,
    toggleDataTable,
    setDataFilter,
    clearDataFilter,
})(OverlayCard)
