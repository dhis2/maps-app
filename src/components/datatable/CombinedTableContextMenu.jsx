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
    buildFeatureIndex,
    getUnionBounds,
    mergeCrossLayerIds,
} from '../../util/dataTable.js'
import { drillUpDown } from '../../util/map.js'
import { IconZoomIn16 } from '../core/icons.jsx'

const CombinedTableContextMenu = ({
    contextMenu,
    referenceLayer,
    layers,
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
    const allLayers = [referenceLayer, ...layers]

    const referenceFeatureProps = buildFeatureIndex(referenceLayer.data).get(
        rowId
    )?.properties

    const zoomTo = (idsByLayerId) => {
        dispatch(
            highlightFeature({
                layerId: null,
                origin: 'table',
                zoom: true,
                bounds: getUnionBounds(allLayers, idsByLayerId),
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
                    {referenceFeatureProps && (
                        <MenuItem
                            dataTest="combined-table-context-menu-drill-up"
                            label={i18n.t('Drill up one level')}
                            icon={<IconArrowUp16 />}
                            disabled={!referenceFeatureProps.hasCoordinatesUp}
                            onClick={() => {
                                dispatch(
                                    updateLayer(
                                        drillUpDown(
                                            referenceLayer,
                                            referenceFeatureProps.grandParentId,
                                            referenceFeatureProps.grandParentParentGraph,
                                            Number.parseInt(
                                                referenceFeatureProps.level
                                            ) - 1
                                        )
                                    )
                                )
                                onClose()
                            }}
                        />
                    )}
                    {referenceFeatureProps && (
                        <MenuItem
                            dataTest="combined-table-context-menu-drill-down"
                            label={i18n.t('Drill down one level')}
                            icon={<IconArrowDown16 />}
                            disabled={!referenceFeatureProps.hasCoordinatesDown}
                            onClick={() => {
                                dispatch(
                                    updateLayer(
                                        drillUpDown(
                                            referenceLayer,
                                            referenceFeatureProps.id,
                                            referenceFeatureProps.parentGraph,
                                            Number.parseInt(
                                                referenceFeatureProps.level
                                            ) + 1
                                        )
                                    )
                                )
                                onClose()
                            }}
                        />
                    )}
                    <MenuItem
                        dataTest="combined-table-context-menu-zoom-to-feature"
                        label={i18n.t('Zoom to feature')}
                        icon={<IconZoomIn16 />}
                        disabled={!getUnionBounds(allLayers, entry)}
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
    layers: PropTypes.array.isRequired,
    referenceLayer: PropTypes.object.isRequired,
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
