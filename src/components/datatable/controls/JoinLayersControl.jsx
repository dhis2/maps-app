import i18n from '@dhis2/d2-i18n'
import { IconVisualizationColumnMulti16 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useRef, useState } from 'react'
import { getCombinedAggregationTypes } from '../../../constants/aggregationTypes.js'
import {
    GEO_TYPE_POINT,
    GEO_TYPE_POLYGON,
    GEO_TYPE_MULTIPOLYGON,
} from '../../../util/geojson.js'
import { FilterDropdownPopover } from '../FilterDropdownPopover.jsx'
import styles from './styles/JoinLayersControl.module.css'
import ToolbarIconButton from './ToolbarIconButton.jsx'

const VALUE_KEY = 'rawValue'
const DEFAULT_SETTINGS = {
    type: 'orgUnit',
    aggregation: { [VALUE_KEY]: 'SUM' },
}

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

const JoinLayersControl = ({ eligibleLayers, layersConfig, onChange }) => {
    const anchorRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)
    const aggregationTypes = getCombinedAggregationTypes()

    const onToggle = (layerId) => {
        const next = { ...layersConfig }
        if (next[layerId]) {
            delete next[layerId]
        } else {
            next[layerId] = DEFAULT_SETTINGS
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
                                            onChange={() => onToggle(layer.id)}
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
                                            <select
                                                aria-label={i18n.t(
                                                    'Aggregation type for {{layer}}',
                                                    { layer: layer.name }
                                                )}
                                                value={
                                                    settings.aggregation?.[
                                                        VALUE_KEY
                                                    ] ?? 'SUM'
                                                }
                                                onChange={(e) =>
                                                    onAggregationChange(
                                                        layer.id,
                                                        VALUE_KEY,
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                {aggregationTypes.map(
                                                    (type) => (
                                                        <option
                                                            key={type.id}
                                                            value={type.id}
                                                        >
                                                            {type.name}
                                                        </option>
                                                    )
                                                )}
                                            </select>
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
