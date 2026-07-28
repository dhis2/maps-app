import i18n from '@dhis2/d2-i18n'
import {
    Popover,
    Menu,
    MenuItem,
    IconArrowDown16,
    IconArrowUp16,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useRef } from 'react'
import { useDispatch } from 'react-redux'
import { highlightFeature } from '../../actions/feature.js'
import { updateLayer } from '../../actions/layers.js'
import {
    BOUNDARY_LAYER,
    EVENT_LAYER,
    FACILITY_LAYER,
    GEOJSON_URL_LAYER,
    TRACKED_ENTITY_LAYER,
} from '../../constants/layers.js'
import {
    buildFeatureIndex,
    getUnionBounds,
    mergeCrossLayerIds,
} from '../../util/dataTable.js'
import { drillUpDown } from '../../util/map.js'
import { IconZoomIn16 } from '../core/icons.jsx'

const NON_DRILLABLE_LAYER_TYPES = [
    BOUNDARY_LAYER,
    FACILITY_LAYER,
    EVENT_LAYER,
    GEOJSON_URL_LAYER,
    TRACKED_ENTITY_LAYER,
]

// Drill up/down only makes sense for a row that names a single org unit
// (the 'orgUnit' join mode) - a parentOrgUnit row groups several org units
// with no single org unit to drill from, and a spatial row's point/polygon
// features aren't org units at all.
const getDrillTargets = (layers, entry) =>
    layers
        .filter((layer) => !NON_DRILLABLE_LAYER_TYPES.includes(layer.layer))
        .map((layer) => {
            const id = entry?.[layer.id]?.[0]
            const featureProps = id
                ? buildFeatureIndex(layer.data).get(id)?.properties
                : null
            return { layer, featureProps }
        })
        .filter((target) => target.featureProps)

const CombinedTableContextMenu = ({
    contextMenu,
    layers,
    joinConfig,
    rowFeatureIds,
    selectedIds,
    filteredIds,
    onClose,
}) => {
    const anchorRef = useRef()
    const dispatch = useDispatch()

    if (!contextMenu) {
        return null
    }

    const { x, y, rowId } = contextMenu
    const entry = rowFeatureIds.get(rowId) ?? {}

    const canDrill = joinConfig.level === 'orgUnit'
    const drillTargets = canDrill ? getDrillTargets(layers, entry) : []
    const hasCoordinatesUp = drillTargets.some(
        ({ featureProps }) => featureProps.hasCoordinatesUp
    )
    const hasCoordinatesDown = drillTargets.some(
        ({ featureProps }) => featureProps.hasCoordinatesDown
    )

    const zoomTo = (idsByLayerId) => {
        const bounds = getUnionBounds(layers, idsByLayerId)
        dispatch(
            highlightFeature({
                layerId: null,
                origin: 'table',
                zoom: true,
                bounds,
                crossLayerIds: idsByLayerId,
            })
        )
        onClose()
    }

    return (
        <>
            <div
                ref={anchorRef}
                style={{
                    position: 'fixed',
                    left: x,
                    top: y,
                    width: 0,
                    height: 0,
                    pointerEvents: 'none',
                }}
            />
            <Popover
                reference={anchorRef}
                arrow={false}
                placement="right"
                onClickOutside={onClose}
            >
                <Menu dense dataTest="combined-table-context-menu">
                    {canDrill && (
                        <MenuItem
                            dataTest="combined-table-context-menu-drill-up"
                            label={i18n.t('Drill up one level')}
                            icon={<IconArrowUp16 />}
                            disabled={!hasCoordinatesUp}
                            onClick={() => {
                                drillTargets
                                    .filter(
                                        ({ featureProps }) =>
                                            featureProps.hasCoordinatesUp
                                    )
                                    .forEach(({ layer, featureProps }) => {
                                        dispatch(
                                            updateLayer(
                                                drillUpDown(
                                                    layer,
                                                    featureProps.grandParentId,
                                                    featureProps.grandParentParentGraph,
                                                    Number.parseInt(
                                                        featureProps.level
                                                    ) - 1
                                                )
                                            )
                                        )
                                    })
                                onClose()
                            }}
                        />
                    )}
                    {canDrill && (
                        <MenuItem
                            dataTest="combined-table-context-menu-drill-down"
                            label={i18n.t('Drill down one level')}
                            icon={<IconArrowDown16 />}
                            disabled={!hasCoordinatesDown}
                            onClick={() => {
                                drillTargets
                                    .filter(
                                        ({ featureProps }) =>
                                            featureProps.hasCoordinatesDown
                                    )
                                    .forEach(({ layer, featureProps }) => {
                                        dispatch(
                                            updateLayer(
                                                drillUpDown(
                                                    layer,
                                                    featureProps.id,
                                                    featureProps.parentGraph,
                                                    Number.parseInt(
                                                        featureProps.level
                                                    ) + 1
                                                )
                                            )
                                        )
                                    })
                                onClose()
                            }}
                        />
                    )}
                    <MenuItem
                        dataTest="combined-table-context-menu-zoom-to-feature"
                        label={i18n.t('Zoom to feature')}
                        icon={<IconZoomIn16 />}
                        disabled={!getUnionBounds(layers, entry)}
                        onClick={() => zoomTo(entry)}
                    />
                    <MenuItem
                        dataTest="combined-table-context-menu-zoom-to-selected"
                        label={i18n.t('Zoom to selected features')}
                        icon={<IconZoomIn16 />}
                        disabled={!selectedIds?.length}
                        onClick={() =>
                            zoomTo(
                                mergeCrossLayerIds(selectedIds, rowFeatureIds)
                            )
                        }
                    />
                    <MenuItem
                        dataTest="combined-table-context-menu-zoom-to-filtered"
                        label={i18n.t('Zoom to filtered features')}
                        icon={<IconZoomIn16 />}
                        disabled={!filteredIds?.length}
                        onClick={() =>
                            zoomTo(
                                mergeCrossLayerIds(filteredIds, rowFeatureIds)
                            )
                        }
                    />
                </Menu>
            </Popover>
        </>
    )
}

CombinedTableContextMenu.propTypes = {
    joinConfig: PropTypes.shape({
        level: PropTypes.string,
    }).isRequired,
    layers: PropTypes.array.isRequired,
    rowFeatureIds: PropTypes.instanceOf(Map).isRequired,
    onClose: PropTypes.func.isRequired,
    contextMenu: PropTypes.shape({
        rowId: PropTypes.string,
        x: PropTypes.number,
        y: PropTypes.number,
    }),
    filteredIds: PropTypes.array,
    selectedIds: PropTypes.array,
}

export default CombinedTableContextMenu
