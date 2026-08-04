import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useMemo, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { clearDataFilters } from '../../../actions/dataFilters.js'
import { setForceClientCluster } from '../../../actions/layers.js'
import {
    DATA_KEY_KIND_CATEGORY,
    ORG_UNIT_PATH_DATA_KEY,
} from '../../../constants/dataTable.js'
import {
    getUnmatchedFeatureCount,
    hasCombinedRollup,
} from '../../../util/combinedJoinMatch.js'
import {
    getCombinedValueDataKeys,
    getDefaultCombinedAggregation,
} from '../../../util/dataTable.js'
import { IconLayersStack16 } from '../../core/icons.jsx'
import { FilterDropdownPopover } from '../FilterDropdownPopover.jsx'
import LayerRow from './LayerRow.jsx'
import styles from './styles/JoinLayersControl.module.css'
import ToolbarIconButton from './ToolbarIconButton.jsx'

const hasOrgUnitIdentity = (layer) => {
    const feature = layer.data?.[0]
    return !!(feature?.properties ?? feature)?.[ORG_UNIT_PATH_DATA_KEY]
}

const getDefaultSettings = (layer) => ({
    type: hasOrgUnitIdentity(layer) ? 'orgUnit' : 'spatial',
    aggregation: getDefaultCombinedAggregation(layer),
})

const JoinLayersControl = ({
    eligibleLayers,
    layersConfig,
    onChange,
    referenceLayer,
}) => {
    const anchorRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)
    const [expandedKeys, setExpandedKeys] = useState(() => new Set())
    const dispatch = useDispatch()

    const openPopover = () => {
        setExpandedKeys(new Set())
        setIsOpen(true)
    }

    const joinQualityByLayerKey = useMemo(() => {
        const result = {}
        eligibleLayers.forEach((layer) => {
            const settings = layersConfig[layer.combinedLayerKey]
            if (!settings) {
                return
            }
            result[layer.combinedLayerKey] = {
                hasRollup: hasCombinedRollup(
                    layer,
                    referenceLayer,
                    settings.type
                ),
                unmatchedCount: getUnmatchedFeatureCount(
                    layer,
                    referenceLayer,
                    settings.type
                ),
            }
        })
        return result
    }, [eligibleLayers, layersConfig, referenceLayer])

    const onToggle = (layer) => {
        const next = { ...layersConfig }
        if (next[layer.combinedLayerKey]) {
            delete next[layer.combinedLayerKey]
        } else {
            next[layer.combinedLayerKey] = getDefaultSettings(layer)
            setExpandedKeys((prev) => new Set(prev).add(layer.combinedLayerKey))
        }
        onChange(next)
    }

    const onToggleExpand = (layerKey) =>
        setExpandedKeys((prev) => {
            const next = new Set(prev)
            if (next.has(layerKey)) {
                next.delete(layerKey)
            } else {
                next.add(layerKey)
            }
            return next
        })

    const onTypeChange = (layerKey, type) =>
        onChange({
            ...layersConfig,
            [layerKey]: { ...layersConfig[layerKey], type },
        })

    const onAggregationChange = (layerKey, dataKey, aggregationType) =>
        onChange({
            ...layersConfig,
            [layerKey]: {
                ...layersConfig[layerKey],
                aggregation: {
                    ...layersConfig[layerKey].aggregation,
                    [dataKey]: aggregationType,
                },
            },
        })

    return (
        <>
            <ToolbarIconButton
                ref={anchorRef}
                tooltip={i18n.t('Choose layers to combine')}
                ariaLabel={i18n.t('Choose layers to combine')}
                dataTest="data-table-join-layers-button"
                disabled={!eligibleLayers.length}
                onClick={() => (isOpen ? setIsOpen(false) : openPopover())}
            >
                <IconLayersStack16 />
            </ToolbarIconButton>
            {isOpen && (
                <FilterDropdownPopover
                    reference={anchorRef}
                    placement="top-start"
                    onClickOutside={() => setIsOpen(false)}
                >
                    <div className={styles.joinLayersPopover}>
                        <div className={styles.layerList}>
                            {eligibleLayers.map((layer) => {
                                const settings =
                                    layersConfig[layer.combinedLayerKey]
                                const hasDataFilters =
                                    Object.keys(layer.dataFilters ?? {})
                                        .length > 0
                                const isServerClustered =
                                    layer.serverCluster &&
                                    !layer.forceClientCluster
                                const defaultAggregation =
                                    getDefaultCombinedAggregation(layer)
                                const {
                                    hasRollup = false,
                                    unmatchedCount = 0,
                                } =
                                    joinQualityByLayerKey[
                                        layer.combinedLayerKey
                                    ] ?? {}
                                const valueDataKeys =
                                    getCombinedValueDataKeys(layer)
                                const categoryDataKeys = valueDataKeys.filter(
                                    ({ kind }) =>
                                        kind === DATA_KEY_KIND_CATEGORY
                                )
                                const seenAggregationKeys = new Set()
                                const otherDataKeys = valueDataKeys
                                    .filter(
                                        ({ kind }) =>
                                            kind !== DATA_KEY_KIND_CATEGORY
                                    )
                                    .filter(({ dataKey, settingsKey }) => {
                                        const key = settingsKey ?? dataKey
                                        if (seenAggregationKeys.has(key)) {
                                            return false
                                        }
                                        seenAggregationKeys.add(key)
                                        return true
                                    })
                                return (
                                    <LayerRow
                                        key={layer.id}
                                        layer={layer}
                                        isExpanded={expandedKeys.has(
                                            layer.combinedLayerKey
                                        )}
                                        onToggleExpand={() =>
                                            onToggleExpand(
                                                layer.combinedLayerKey
                                            )
                                        }
                                        onToggleJoined={() => onToggle(layer)}
                                        hasDataFilters={hasDataFilters}
                                        onClearDataFilters={() =>
                                            dispatch(clearDataFilters(layer.id))
                                        }
                                        isServerClustered={isServerClustered}
                                        onForceClientCluster={() =>
                                            dispatch(
                                                setForceClientCluster(layer.id)
                                            )
                                        }
                                        settings={settings}
                                        defaultAggregation={defaultAggregation}
                                        hasRollup={hasRollup}
                                        unmatchedCount={unmatchedCount}
                                        categoryDataKeys={categoryDataKeys}
                                        otherDataKeys={otherDataKeys}
                                        onTypeChange={(type) =>
                                            onTypeChange(
                                                layer.combinedLayerKey,
                                                type
                                            )
                                        }
                                        onAggregationChange={(dataKey, type) =>
                                            onAggregationChange(
                                                layer.combinedLayerKey,
                                                dataKey,
                                                type
                                            )
                                        }
                                    />
                                )
                            })}
                        </div>
                    </div>
                </FilterDropdownPopover>
            )}
        </>
    )
}

JoinLayersControl.propTypes = {
    eligibleLayers: PropTypes.arrayOf(
        PropTypes.shape({
            combinedLayerKey: PropTypes.string,
            data: PropTypes.array,
            id: PropTypes.string,
            layer: PropTypes.string,
            name: PropTypes.string,
        })
    ).isRequired,
    layersConfig: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    referenceLayer: PropTypes.object,
}

export default JoinLayersControl
