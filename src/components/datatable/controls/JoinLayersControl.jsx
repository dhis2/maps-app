import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useRef, useState } from 'react'
import { getCombinedAggregationTypes } from '../../../constants/aggregationTypes.js'
import { ORG_UNIT_PATH_DATA_KEY } from '../../../constants/dataTable.js'
import { getCombinedValueDataKeys } from '../../../util/dataTable.js'
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
    aggregation: Object.fromEntries(
        getCombinedValueDataKeys(layer).map(({ dataKey }) => [dataKey, 'SUM'])
    ),
})

const JoinLayersControl = ({ eligibleLayers, layersConfig, onChange }) => {
    const anchorRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)
    const aggregationTypes = getCombinedAggregationTypes()

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
                                                <select
                                                    aria-label={i18n.t(
                                                        'Join type for {{layer}}',
                                                        { layer: layer.name }
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
                                                            {i18n.t('Spatial')}
                                                        </option>
                                                    )}
                                                </select>
                                                {getCombinedValueDataKeys(
                                                    layer
                                                ).map(({ dataKey, name }) => (
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
                                                                settings
                                                                    .aggregation?.[
                                                                    dataKey
                                                                ] ?? 'SUM'
                                                            }
                                                            onChange={(e) =>
                                                                onAggregationChange(
                                                                    layer.combinedLayerKey,
                                                                    dataKey,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        >
                                                            {aggregationTypes.map(
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
                                                ))}
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
}

export default JoinLayersControl
