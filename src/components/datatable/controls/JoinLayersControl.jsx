import i18n from '@dhis2/d2-i18n'
import { IconWarningFilled16, Tooltip } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useMemo, useRef, useState } from 'react'
import {
    getCategoryValueDisplayTypes,
    getCombinedAggregationTypes,
} from '../../../constants/aggregationTypes.js'
import {
    DATA_KEY_KIND_CATEGORY,
    DATA_KEY_KIND_COUNT,
    ORG_UNIT_PATH_DATA_KEY,
} from '../../../constants/dataTable.js'
import {
    FACILITY_LAYER,
    ORG_UNIT_LAYER,
    EVENT_LAYER,
    TRACKED_ENTITY_LAYER,
} from '../../../constants/layers.js'
import { NON_COMPOSABLE_AGGREGATION_TYPES } from '../../../util/aggregation.js'
import {
    getUnmatchedFeatureCount,
    hasCombinedRollup,
} from '../../../util/combinedJoinMatch.js'
import {
    CATEGORY_DISPLAY_TYPE_KEY,
    getCombinedValueDataKeys,
    getDefaultCombinedAggregation,
} from '../../../util/dataTable.js'
import {
    GEO_TYPE_POINT,
    GEO_TYPE_POLYGON,
    GEO_TYPE_MULTIPOLYGON,
} from '../../../util/geojson.js'
import Checkbox from '../../core/Checkbox.jsx'
import { IconLayersStack16 } from '../../core/icons.jsx'
import { FilterDropdownPopover } from '../FilterDropdownPopover.jsx'
import styles from './styles/JoinLayersControl.module.css'
import ToolbarIconButton from './ToolbarIconButton.jsx'

const isSpatialEligible = (layer) => {
    const geometryType = layer.data?.[0]?.geometry?.type
    return [GEO_TYPE_POINT, GEO_TYPE_POLYGON, GEO_TYPE_MULTIPOLYGON].includes(
        geometryType
    )
}

const hasOrgUnitIdentity = (layer) => {
    const feature = layer.data?.[0]
    return !!(feature?.properties ?? feature)?.[ORG_UNIT_PATH_DATA_KEY]
}

const getDefaultSettings = (layer) => ({
    type: hasOrgUnitIdentity(layer) ? 'orgUnit' : 'spatial',
    aggregation: getDefaultCombinedAggregation(layer),
})

const COUNT_LABEL_BY_LAYER_TYPE = {
    [FACILITY_LAYER]: () => i18n.t('Facilities count'),
    [ORG_UNIT_LAYER]: () => i18n.t('Org units count'),
    [EVENT_LAYER]: () => i18n.t('Events count'),
    [TRACKED_ENTITY_LAYER]: () => i18n.t('Tracked entities count'),
}

const getCountLabel = (layer) =>
    COUNT_LABEL_BY_LAYER_TYPE[layer.layer]?.() ?? i18n.t('Count')

const JoinLayersControl = ({
    eligibleLayers,
    layersConfig,
    onChange,
    referenceLayer,
}) => {
    const anchorRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)
    const aggregationTypes = getCombinedAggregationTypes()

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
        }
        onChange(next)
    }

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
                onClick={() => setIsOpen((o) => !o)}
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
                                    <div
                                        key={layer.id}
                                        className={styles.layerRow}
                                    >
                                        <Checkbox
                                            label={
                                                <span
                                                    className={styles.layerName}
                                                >
                                                    {layer.name}
                                                </span>
                                            }
                                            checked={!!settings}
                                            onChange={() => onToggle(layer)}
                                            className={styles.layerCheckbox}
                                            dataTest={`data-table-join-layer-${layer.id}`}
                                        />
                                        {settings && (
                                            <div
                                                className={styles.layerSettings}
                                            >
                                                <div
                                                    className={
                                                        styles.aggregationRow
                                                    }
                                                >
                                                    <select
                                                        aria-label={i18n.t(
                                                            'Join type for {{layer}}',
                                                            {
                                                                layer: layer.name,
                                                            }
                                                        )}
                                                        value={settings.type}
                                                        onChange={(e) =>
                                                            onTypeChange(
                                                                layer.combinedLayerKey,
                                                                e.target.value
                                                            )
                                                        }
                                                    >
                                                        <option value="orgUnit">
                                                            {i18n.t('Org unit')}
                                                        </option>
                                                        {isSpatialEligible(
                                                            layer
                                                        ) && (
                                                            <option value="spatial">
                                                                {i18n.t(
                                                                    'Spatial'
                                                                )}
                                                            </option>
                                                        )}
                                                    </select>
                                                    {unmatchedCount > 0 && (
                                                        <Tooltip
                                                            content={i18n.t(
                                                                '{{count}} feature(s) from {{layer}} could not be matched to a reference org unit (wrong level, no matching parent, or outside every boundary) and will be excluded from the Combined table.',
                                                                {
                                                                    count: unmatchedCount,
                                                                    layer: layer.name,
                                                                }
                                                            )}
                                                        >
                                                            <span
                                                                className={
                                                                    styles.aggregationWarning
                                                                }
                                                                data-test={`data-table-join-unmatched-warning-${layer.id}`}
                                                            >
                                                                <IconWarningFilled16 />
                                                            </span>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                                {otherDataKeys.map(
                                                    ({
                                                        dataKey,
                                                        name,
                                                        kind,
                                                        settingsKey,
                                                    }) => {
                                                        if (
                                                            kind ===
                                                            DATA_KEY_KIND_COUNT
                                                        ) {
                                                            return (
                                                                <div
                                                                    key={
                                                                        dataKey
                                                                    }
                                                                    className={
                                                                        styles.aggregationRow
                                                                    }
                                                                >
                                                                    <span
                                                                        className={
                                                                            styles.aggregationRowLabel
                                                                        }
                                                                    >
                                                                        {getCountLabel(
                                                                            layer
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            )
                                                        }

                                                        const aggregationKey =
                                                            settingsKey ??
                                                            dataKey
                                                        const effectiveType =
                                                            settings
                                                                .aggregation?.[
                                                                aggregationKey
                                                            ] ??
                                                            defaultAggregation[
                                                                dataKey
                                                            ]
                                                        const showWarning =
                                                            hasRollup &&
                                                            NON_COMPOSABLE_AGGREGATION_TYPES.has(
                                                                effectiveType
                                                            )

                                                        return (
                                                            <div
                                                                key={dataKey}
                                                                className={
                                                                    styles.aggregationRow
                                                                }
                                                            >
                                                                {name && (
                                                                    <span
                                                                        className={
                                                                            styles.aggregationRowLabel
                                                                        }
                                                                    >
                                                                        {name}
                                                                    </span>
                                                                )}
                                                                <select
                                                                    aria-label={
                                                                        name
                                                                            ? i18n.t(
                                                                                  'Aggregation type for {{name}} ({{layer}})',
                                                                                  {
                                                                                      name,
                                                                                      layer: layer.name,
                                                                                  }
                                                                              )
                                                                            : i18n.t(
                                                                                  'Aggregation type for {{layer}}',
                                                                                  {
                                                                                      layer: layer.name,
                                                                                  }
                                                                              )
                                                                    }
                                                                    value={
                                                                        effectiveType
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        onAggregationChange(
                                                                            layer.combinedLayerKey,
                                                                            aggregationKey,
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                >
                                                                    {aggregationTypes.map(
                                                                        (
                                                                            type
                                                                        ) => (
                                                                            <option
                                                                                key={
                                                                                    type.id
                                                                                }
                                                                                value={
                                                                                    type.id
                                                                                }
                                                                            >
                                                                                {
                                                                                    type.name
                                                                                }
                                                                            </option>
                                                                        )
                                                                    )}
                                                                </select>
                                                                {showWarning && (
                                                                    <Tooltip
                                                                        content={i18n.t(
                                                                            'Several {{layer}} features roll up into each reference org unit here - {{type}} is an approximation of the values you can see joined in, not a recomputation over the combined area.',
                                                                            {
                                                                                layer: layer.name,
                                                                                type: effectiveType,
                                                                            }
                                                                        )}
                                                                    >
                                                                        <span
                                                                            className={
                                                                                styles.aggregationWarning
                                                                            }
                                                                            data-test={`data-table-join-aggregation-warning-${layer.id}-${dataKey}`}
                                                                        >
                                                                            <IconWarningFilled16 />
                                                                        </span>
                                                                    </Tooltip>
                                                                )}
                                                            </div>
                                                        )
                                                    }
                                                )}
                                                {categoryDataKeys.length >
                                                    0 && (
                                                    <div
                                                        className={
                                                            styles.aggregationRow
                                                        }
                                                    >
                                                        <span
                                                            className={
                                                                styles.aggregationRowLabel
                                                            }
                                                        >
                                                            {layer.legend
                                                                ?.unit ??
                                                                i18n.t(
                                                                    'Categories'
                                                                )}
                                                        </span>
                                                        <select
                                                            aria-label={i18n.t(
                                                                'Category display for {{layer}}',
                                                                {
                                                                    layer: layer.name,
                                                                }
                                                            )}
                                                            value={
                                                                settings
                                                                    .aggregation?.[
                                                                    CATEGORY_DISPLAY_TYPE_KEY
                                                                ] ??
                                                                defaultAggregation[
                                                                    CATEGORY_DISPLAY_TYPE_KEY
                                                                ]
                                                            }
                                                            onChange={(e) =>
                                                                onAggregationChange(
                                                                    layer.combinedLayerKey,
                                                                    CATEGORY_DISPLAY_TYPE_KEY,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        >
                                                            {getCategoryValueDisplayTypes().map(
                                                                (type) => (
                                                                    <option
                                                                        key={
                                                                            type.id
                                                                        }
                                                                        value={
                                                                            type.id
                                                                        }
                                                                    >
                                                                        {
                                                                            type.name
                                                                        }
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
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
