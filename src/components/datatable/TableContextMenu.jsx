import i18n from '@dhis2/d2-i18n'
import {
    Popover,
    Menu,
    MenuItem,
    IconArrowDown16,
    IconArrowUp16,
    IconInfo16,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useRef } from 'react'
import { useDispatch } from 'react-redux'
import { highlightFeature, setFeatureProfile } from '../../actions/feature.js'
import { updateLayer } from '../../actions/layers.js'
import { setOrgUnitProfile } from '../../actions/orgUnits.js'
import {
    BOUNDARY_LAYER,
    EVENT_LAYER,
    FACILITY_LAYER,
    GEOJSON_URL_LAYER,
} from '../../constants/layers.js'
import { getGeojsonFeatureProfile } from '../../util/geojson.js'
import { drillUpDown } from '../../util/map.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import { IconZoomIn16 } from '../core/icons.jsx'

const TableContextMenu = ({ contextMenu, layer, onClose }) => {
    const anchorRef = useRef()
    const dispatch = useDispatch()
    const {
        systemSettings: { keyAnalysisDigitGroupSeparator },
    } = useCachedData()

    if (!contextMenu) {
        return null
    }

    const { x, y, featureProps } = contextMenu
    const layerType = layer.layer

    const {
        id,
        level,
        hasCoordinatesUp,
        hasCoordinatesDown,
        grandParentId,
        grandParentParentGraph,
        parentGraph,
    } = featureProps || {}

    const canDrill =
        layerType !== BOUNDARY_LAYER &&
        layerType !== FACILITY_LAYER &&
        layerType !== EVENT_LAYER &&
        layerType !== GEOJSON_URL_LAYER

    const canViewProfile = id && layerType !== EVENT_LAYER

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
                <Menu dense>
                    {canDrill && (
                        <MenuItem
                            label={i18n.t('Drill up one level')}
                            icon={<IconArrowUp16 />}
                            disabled={!hasCoordinatesUp}
                            onClick={() => {
                                dispatch(
                                    updateLayer(
                                        drillUpDown(
                                            layer,
                                            grandParentId,
                                            grandParentParentGraph,
                                            Number.parseInt(level) - 1
                                        )
                                    )
                                )
                                onClose()
                            }}
                        />
                    )}
                    {canDrill && (
                        <MenuItem
                            label={i18n.t('Drill down one level')}
                            icon={<IconArrowDown16 />}
                            disabled={!hasCoordinatesDown}
                            onClick={() => {
                                dispatch(
                                    updateLayer(
                                        drillUpDown(
                                            layer,
                                            id,
                                            parentGraph,
                                            Number.parseInt(level) + 1
                                        )
                                    )
                                )
                                onClose()
                            }}
                        />
                    )}
                    {canViewProfile && (
                        <MenuItem
                            label={i18n.t('View profile')}
                            icon={<IconInfo16 />}
                            onClick={() => {
                                if (layerType === GEOJSON_URL_LAYER) {
                                    dispatch(
                                        setFeatureProfile(
                                            getGeojsonFeatureProfile(
                                                { properties: featureProps },
                                                layer.name,
                                                keyAnalysisDigitGroupSeparator
                                            )
                                        )
                                    )
                                } else {
                                    dispatch(setOrgUnitProfile(id))
                                }
                                onClose()
                            }}
                        />
                    )}
                    {id && (
                        <MenuItem
                            label={i18n.t('Zoom to feature')}
                            icon={<IconZoomIn16 />}
                            onClick={() => {
                                dispatch(
                                    highlightFeature({
                                        id,
                                        layerId: layer.id,
                                        origin: 'table',
                                        zoom: true,
                                    })
                                )
                                onClose()
                            }}
                        />
                    )}
                </Menu>
            </Popover>
        </>
    )
}

TableContextMenu.propTypes = {
    layer: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    contextMenu: PropTypes.shape({
        featureProps: PropTypes.object,
        x: PropTypes.number,
        y: PropTypes.number,
    }),
}

export default TableContextMenu
