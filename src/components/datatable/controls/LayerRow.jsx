import i18n from '@dhis2/d2-i18n'
import {
    IconChevronDown16,
    IconChevronRight16,
    IconReorder16,
    IconWarningFilled16,
    Tooltip,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import {
    getCategoryValueDisplayTypes,
    getCombinedAggregationTypes,
} from '../../../constants/aggregationTypes.js'
import { DATA_KEY_KIND_COUNT } from '../../../constants/dataTable.js'
import {
    FACILITY_LAYER,
    ORG_UNIT_LAYER,
    EVENT_LAYER,
    TRACKED_ENTITY_LAYER,
} from '../../../constants/layers.js'
import { NON_COMPOSABLE_AGGREGATION_TYPES } from '../../../util/aggregation.js'
import { CATEGORY_DISPLAY_TYPE_KEY } from '../../../util/dataTable.js'
import {
    GEO_TYPE_POINT,
    GEO_TYPE_POLYGON,
    GEO_TYPE_MULTIPOLYGON,
} from '../../../util/geojson.js'
import Checkbox from '../../core/Checkbox.jsx'
import { FilterActiveIcon } from '../../core/index.js'
import styles from './styles/JoinLayersControl.module.css'

const isSpatialEligible = (layer) => {
    const geometryType = layer.data?.[0]?.geometry?.type
    return [GEO_TYPE_POINT, GEO_TYPE_POLYGON, GEO_TYPE_MULTIPOLYGON].includes(
        geometryType
    )
}

const COUNT_LABEL_BY_LAYER_TYPE = {
    [FACILITY_LAYER]: () => i18n.t('Facilities count'),
    [ORG_UNIT_LAYER]: () => i18n.t('Org units count'),
    [EVENT_LAYER]: () => i18n.t('Events count'),
    [TRACKED_ENTITY_LAYER]: () => i18n.t('Tracked entities count'),
}

const getCountLabel = (layer) =>
    COUNT_LABEL_BY_LAYER_TYPE[layer.layer]?.() ?? i18n.t('Count')

const LayerRow = ({
    layer,
    isExpanded,
    onToggleExpand,
    onToggleJoined,
    hasDataFilters,
    onClearDataFilters,
    isServerClustered,
    onForceClientCluster,
    settings,
    defaultAggregation,
    hasRollup,
    unmatchedCount,
    categoryDataKeys,
    otherDataKeys,
    onTypeChange,
    onAggregationChange,
}) => {
    const aggregationTypes = getCombinedAggregationTypes()
    const isJoined = !!settings

    return (
        <div className={styles.layerRow}>
            <div className={styles.layerRowHeader}>
                {isJoined ? (
                    <button
                        type="button"
                        className={styles.expandButton}
                        onClick={onToggleExpand}
                        aria-label={
                            isExpanded
                                ? i18n.t('Collapse {{layer}}', {
                                      layer: layer.name,
                                  })
                                : i18n.t('Expand {{layer}}', {
                                      layer: layer.name,
                                  })
                        }
                        data-test={`data-table-join-layer-toggle-${layer.id}`}
                    >
                        {isExpanded ? (
                            <IconChevronDown16 />
                        ) : (
                            <IconChevronRight16 />
                        )}
                    </button>
                ) : (
                    <span className={styles.expandButtonPlaceholder} />
                )}
                <Checkbox
                    label={
                        <span className={styles.layerName}>{layer.name}</span>
                    }
                    checked={isJoined}
                    onChange={onToggleJoined}
                    className={styles.layerCheckbox}
                    dataTest={`data-table-join-layer-${layer.id}`}
                />
                {hasDataFilters && (
                    <>
                        <Tooltip
                            content={i18n.t(
                                'This layer has a filter active from its own table - Combined only reflects the filtered records.'
                            )}
                        >
                            <span
                                className={styles.aggregationWarning}
                                data-test={`data-table-join-datafilters-warning-${layer.id}`}
                            >
                                <IconWarningFilled16 />
                            </span>
                        </Tooltip>
                        <Tooltip
                            content={i18n.t(
                                'Clear filters applied to {{layer}}',
                                { layer: layer.name }
                            )}
                        >
                            <button
                                type="button"
                                className={styles.clearDataFiltersButton}
                                onClick={onClearDataFilters}
                                aria-label={i18n.t(
                                    'Clear filters applied to {{layer}}',
                                    { layer: layer.name }
                                )}
                                data-test={`data-table-join-clear-datafilters-${layer.id}`}
                            >
                                <FilterActiveIcon />
                            </button>
                        </Tooltip>
                    </>
                )}
                {isServerClustered && (
                    <>
                        <Tooltip
                            content={i18n.t(
                                "This layer is clustered on the server - its data isn't available to join into the Combined table."
                            )}
                        >
                            <span
                                className={styles.aggregationWarning}
                                data-test={`data-table-join-servercluster-warning-${layer.id}`}
                            >
                                <IconWarningFilled16 />
                            </span>
                        </Tooltip>
                        <Tooltip
                            content={i18n.t('Switch to client clustering')}
                        >
                            <button
                                type="button"
                                className={styles.clearDataFiltersButton}
                                onClick={onForceClientCluster}
                                aria-label={i18n.t(
                                    'Switch to client clustering'
                                )}
                                data-test={`data-table-join-servercluster-switch-${layer.id}`}
                            >
                                <IconReorder16 />
                            </button>
                        </Tooltip>
                    </>
                )}
            </div>
            {isJoined && isExpanded && (
                <div className={styles.layerSettings}>
                    <div className={styles.aggregationRow}>
                        <span className={styles.aggregationRowLabel}>
                            {i18n.t('Join by')}
                        </span>
                        <select
                            aria-label={i18n.t('Join type for {{layer}}', {
                                layer: layer.name,
                            })}
                            value={settings.type}
                            onChange={(e) => onTypeChange(e.target.value)}
                        >
                            <option value="orgUnit">
                                {i18n.t('Org unit')}
                            </option>
                            {isSpatialEligible(layer) && (
                                <option value="spatial">
                                    {i18n.t('Location')}
                                </option>
                            )}
                        </select>
                        {unmatchedCount > 0 && (
                            <Tooltip
                                content={i18n.t(
                                    '{{count}} feature(s) from {{layer}} could not be matched to a reference org unit (wrong level, no matching parent, or outside every boundary) and will be excluded from the Combined table.',
                                    { count: unmatchedCount, layer: layer.name }
                                )}
                            >
                                <span
                                    className={styles.aggregationWarning}
                                    data-test={`data-table-join-unmatched-warning-${layer.id}`}
                                >
                                    <IconWarningFilled16 />
                                </span>
                            </Tooltip>
                        )}
                    </div>
                    {otherDataKeys.map(
                        ({ dataKey, name, kind, settingsKey }) => {
                            if (kind === DATA_KEY_KIND_COUNT) {
                                return (
                                    <div
                                        key={dataKey}
                                        className={styles.aggregationRow}
                                    >
                                        <span
                                            className={styles.staticValueLabel}
                                        >
                                            {getCountLabel(layer)}
                                        </span>
                                    </div>
                                )
                            }

                            const aggregationKey = settingsKey ?? dataKey
                            const effectiveType =
                                settings.aggregation?.[aggregationKey] ??
                                defaultAggregation[dataKey]
                            const showWarning =
                                hasRollup &&
                                layer.layer !== EVENT_LAYER &&
                                NON_COMPOSABLE_AGGREGATION_TYPES.has(
                                    effectiveType
                                )

                            return (
                                <div
                                    key={dataKey}
                                    className={styles.aggregationRow}
                                >
                                    <span
                                        className={styles.aggregationRowLabel}
                                    >
                                        {name ?? i18n.t('Value')}
                                    </span>
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
                                                      { layer: layer.name }
                                                  )
                                        }
                                        value={effectiveType}
                                        onChange={(e) =>
                                            onAggregationChange(
                                                aggregationKey,
                                                e.target.value
                                            )
                                        }
                                    >
                                        {aggregationTypes.map((type) => (
                                            <option
                                                key={type.id}
                                                value={type.id}
                                            >
                                                {type.name}
                                            </option>
                                        ))}
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
                    {categoryDataKeys.length > 0 && (
                        <div className={styles.aggregationRow}>
                            <span className={styles.aggregationRowLabel}>
                                {layer.legend?.unit ?? i18n.t('Categories')}
                            </span>
                            <select
                                aria-label={i18n.t(
                                    'Category display for {{layer}}',
                                    { layer: layer.name }
                                )}
                                value={
                                    settings.aggregation?.[
                                        CATEGORY_DISPLAY_TYPE_KEY
                                    ] ??
                                    defaultAggregation[
                                        CATEGORY_DISPLAY_TYPE_KEY
                                    ]
                                }
                                onChange={(e) =>
                                    onAggregationChange(
                                        CATEGORY_DISPLAY_TYPE_KEY,
                                        e.target.value
                                    )
                                }
                            >
                                {getCategoryValueDisplayTypes().map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

LayerRow.propTypes = {
    categoryDataKeys: PropTypes.array.isRequired,
    hasDataFilters: PropTypes.bool.isRequired,
    hasRollup: PropTypes.bool.isRequired,
    isExpanded: PropTypes.bool.isRequired,
    isServerClustered: PropTypes.bool.isRequired,
    layer: PropTypes.shape({
        data: PropTypes.array,
        id: PropTypes.string,
        layer: PropTypes.string,
        legend: PropTypes.object,
        name: PropTypes.string,
    }).isRequired,
    otherDataKeys: PropTypes.array.isRequired,
    unmatchedCount: PropTypes.number.isRequired,
    onAggregationChange: PropTypes.func.isRequired,
    onClearDataFilters: PropTypes.func.isRequired,
    onForceClientCluster: PropTypes.func.isRequired,
    onToggleExpand: PropTypes.func.isRequired,
    onToggleJoined: PropTypes.func.isRequired,
    onTypeChange: PropTypes.func.isRequired,
    defaultAggregation: PropTypes.object,
    settings: PropTypes.shape({
        aggregation: PropTypes.object,
        type: PropTypes.string,
    }),
}

export default LayerRow
