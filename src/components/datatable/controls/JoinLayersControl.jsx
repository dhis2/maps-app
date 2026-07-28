import i18n from '@dhis2/d2-i18n'
import { IconVisualizationColumnMulti16 } from '@dhis2/ui'
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
import { FilterDropdownPopover } from '../FilterDropdownPopover.jsx'
import styles from './styles/JoinLayersControl.module.css'
import ToolbarIconButton from './ToolbarIconButton.jsx'

// Spatial join means point-in-polygon against the reference org unit's own
// boundary - offered for any layer whose features are literally points, or
// whose geometry is a polygon/multipolygon (matched via its centroid
// instead - see util/spatialJoin.js). Geometry-based, not layer-type-based:
// this is what makes a GeoJSON URL layer (or any other layer type with no
// org-unit identity of its own) still joinable in Combined even though
// "Org unit" join can never match anything for it.
const isSpatialEligible = (layer) => {
    const geometryType = layer.data?.[0]?.geometry?.type
    return [GEO_TYPE_POINT, GEO_TYPE_POLYGON, GEO_TYPE_MULTIPOLYGON].includes(
        geometryType
    )
}

// A layer with no org-unit path on its own features (e.g. GeoJSON URL) can
// never match anything under "Org unit" join - defaulting a newly-checked
// layer to that mode would silently leave every cell blank until the user
// happens to switch it to Spatial themselves. Default to whichever mode can
// actually match instead.
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
        if (next[layer.id]) {
            delete next[layer.id]
        } else {
            next[layer.id] = getDefaultSettings(layer)
        }
        onChange(next)
    }

    const onTypeChange = (layerId, type) =>
        onChange({
            ...layersConfig,
            [layerId]: { ...layersConfig[layerId], type },
        })

    const onAggregationChange = (layerId, dataKey, aggregationType) =>
        onChange({
            ...layersConfig,
            [layerId]: {
                ...layersConfig[layerId],
                aggregation: {
                    ...layersConfig[layerId].aggregation,
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
                <IconVisualizationColumnMulti16 />
            </ToolbarIconButton>
            {isOpen && (
                <FilterDropdownPopover
                    reference={anchorRef}
                    placement="top-start"
                    onClickOutside={() => setIsOpen(false)}
                >
                    <div className={styles.joinLayersPopover}>
                        {eligibleLayers.map((layer) => {
                            const settings = layersConfig[layer.id]
                            return (
                                <div key={layer.id} className={styles.layerRow}>
                                    <label
                                        className={styles.layerCheckboxLabel}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={!!settings}
                                            onChange={() => onToggle(layer)}
                                        />
                                        <span className={styles.layerName}>
                                            {layer.name}
                                        </span>
                                    </label>
                                    {settings && (
                                        <div className={styles.layerSettings}>
                                            <select
                                                aria-label={i18n.t(
                                                    'Join type for {{layer}}',
                                                    { layer: layer.name }
                                                )}
                                                value={settings.type}
                                                onChange={(e) =>
                                                    onTypeChange(
                                                        layer.id,
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="orgUnit">
                                                    {i18n.t('Org unit')}
                                                </option>
                                                {isSpatialEligible(layer) && (
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
                                                                layer.id,
                                                                dataKey,
                                                                e.target.value
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
                                                                    {type.name}
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
                </FilterDropdownPopover>
            )}
        </>
    )
}

JoinLayersControl.propTypes = {
    eligibleLayers: PropTypes.arrayOf(
        PropTypes.shape({
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
