import i18n from '@dhis2/d2-i18n'
import {
    Popover,
    Menu,
    MenuItem,
    IconArrowUp16,
    IconArrowDown16,
    IconInfo16,
    IconLocation16,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { Fragment, useRef } from 'react'
import { connect } from 'react-redux'
import { highlightFeature, setFeatureProfile } from '../../actions/feature.js'
import { updateLayer } from '../../actions/layers.js'
import {
    closeContextMenu,
    openCoordinatePopup,
    showEarthEngineValue,
} from '../../actions/map.js'
import { setOrgUnitProfile } from '../../actions/orgUnits.js'
import {
    FACILITY_LAYER,
    GEOJSON_URL_LAYER,
    EARTH_ENGINE_LAYER,
    EVENT_LAYER,
    TRACKED_ENTITY_LAYER,
    RENDERING_STRATEGY_SPLIT_BY_PERIOD,
} from '../../constants/layers.js'
import { getGeojsonFeatureProfile } from '../../util/geojson.js'
import { drillUpDown } from '../../util/map.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import { IconZoomIn16 } from '../core/icons.jsx'
import styles from './styles/ContextMenu.module.css'

const ContextMenu = (props) => {
    const anchorRef = useRef()
    const {
        systemSettings: { keyAnalysisDigitGroupSeparator },
    } = useCachedData()

    const {
        feature,
        layerType,
        layerConfig,
        coordinates,
        earthEngineLayers,
        selectedIds,
        position,
        offset,
        closeContextMenu,
        highlightFeature,
        openCoordinatePopup,
        showEarthEngineValue,
        setOrgUnitProfile,
        setFeatureProfile,
        updateLayer,
    } = props

    if (!position) {
        return null
    }

    const isSplitView =
        layerConfig?.renderingStrategy === RENDERING_STRATEGY_SPLIT_BY_PERIOD

    const supportsProfileAndDrill =
        layerType !== EVENT_LAYER && layerType !== TRACKED_ENTITY_LAYER

    const left = offset[0] + position[0]
    const top = offset[1] + position[1]

    const attr = feature?.properties || {}

    const onClick = (item, id) => {
        closeContextMenu()

        switch (item) {
            case 'drill_up':
                updateLayer(
                    drillUpDown(
                        layerConfig,
                        attr.grandParentId,
                        attr.grandParentParentGraph,
                        parseInt(attr.level) - 1
                    )
                )
                break
            case 'drill_down':
                updateLayer(
                    drillUpDown(
                        layerConfig,
                        attr.id,
                        attr.parentGraph,
                        parseInt(attr.level) + 1
                    )
                )
                break
            case 'show_info':
                if (layerType === GEOJSON_URL_LAYER) {
                    setFeatureProfile(
                        getGeojsonFeatureProfile(
                            { properties: attr },
                            layerConfig.name,
                            keyAnalysisDigitGroupSeparator
                        )
                    )
                } else {
                    setOrgUnitProfile(attr.id)
                }
                break
            case 'show_coordinate':
                openCoordinatePopup(coordinates)
                break
            case 'show_ee_value':
                showEarthEngineValue(id, coordinates)
                break
            case 'zoom_to_feature':
                highlightFeature({
                    id: attr.id,
                    layerId: layerConfig.id,
                    origin: 'map',
                    zoom: true,
                })
                break
            case 'zoom_to_layer':
                highlightFeature({
                    layerId: layerConfig.id,
                    origin: 'map',
                    zoom: true,
                })
                break
            case 'zoom_to_selected':
                highlightFeature({
                    ids: selectedIds,
                    layerId: layerConfig.id,
                    origin: 'map',
                    zoom: true,
                })
                break

            default:
        }
    }

    return (
        <Fragment>
            <div
                ref={anchorRef}
                className={styles.anchor}
                style={{ left, top }}
            />
            <Popover
                reference={anchorRef}
                arrow={false}
                placement="right"
                onClickOutside={closeContextMenu}
            >
                <div className={styles.menu}>
                    <Menu dense dataTest="context-menu">
                        {supportsProfileAndDrill &&
                            layerType !== FACILITY_LAYER &&
                            layerType !== GEOJSON_URL_LAYER &&
                            feature && (
                                <MenuItem
                                    dataTest="context-menu-drill-up"
                                    label={i18n.t('Drill up one level')}
                                    icon={<IconArrowUp16 />}
                                    disabled={!attr.hasCoordinatesUp}
                                    onClick={() => onClick('drill_up')}
                                />
                            )}

                        {supportsProfileAndDrill &&
                            layerType !== FACILITY_LAYER &&
                            layerType !== GEOJSON_URL_LAYER &&
                            feature && (
                                <MenuItem
                                    dataTest="context-menu-drill-down"
                                    label={i18n.t('Drill down one level')}
                                    icon={<IconArrowDown16 />}
                                    disabled={!attr.hasCoordinatesDown}
                                    onClick={() => onClick('drill_down')}
                                />
                            )}

                        {supportsProfileAndDrill && feature && (
                            <MenuItem
                                dataTest="context-menu-view-profile"
                                label={i18n.t('View profile')}
                                icon={<IconInfo16 />}
                                onClick={() => onClick('show_info')}
                            />
                        )}

                        {feature && (
                            <MenuItem
                                dataTest="context-menu-zoom-to-feature"
                                label={i18n.t('Zoom to feature')}
                                icon={<IconZoomIn16 />}
                                onClick={() => onClick('zoom_to_feature')}
                            />
                        )}

                        {feature && (
                            <MenuItem
                                dataTest="context-menu-zoom-to-layer"
                                label={i18n.t('Zoom to layer')}
                                icon={<IconZoomIn16 />}
                                onClick={() => onClick('zoom_to_layer')}
                            />
                        )}

                        <MenuItem
                            dataTest="context-menu-zoom-to-selected"
                            label={i18n.t('Zoom to selected features')}
                            icon={<IconZoomIn16 />}
                            disabled={!selectedIds.length}
                            onClick={() => onClick('zoom_to_selected')}
                        />

                        {coordinates && !isSplitView && (
                            <MenuItem
                                dataTest="context-menu-show-long-lat"
                                label={i18n.t('Show longitude/latitude')}
                                icon={<IconLocation16 />}
                                onClick={() => onClick('show_coordinate')}
                            />
                        )}

                        {earthEngineLayers.map((layer) => (
                            <MenuItem
                                dataTest="context-menu-show-ee-value"
                                key={layer.id}
                                label={i18n.t('Show {{name}}', {
                                    name: layer.name.toLowerCase(),
                                })}
                                icon={<IconLocation16 />}
                                onClick={() =>
                                    onClick('show_ee_value', layer.id)
                                }
                            />
                        ))}
                    </Menu>
                </div>
            </Popover>
        </Fragment>
    )
}

ContextMenu.propTypes = {
    closeContextMenu: PropTypes.func.isRequired,
    highlightFeature: PropTypes.func.isRequired,
    openCoordinatePopup: PropTypes.func.isRequired,
    setFeatureProfile: PropTypes.func.isRequired,
    setOrgUnitProfile: PropTypes.func.isRequired,
    showEarthEngineValue: PropTypes.func.isRequired,
    updateLayer: PropTypes.func.isRequired,
    coordinates: PropTypes.array,
    earthEngineLayers: PropTypes.array,
    feature: PropTypes.object,
    layerConfig: PropTypes.object,
    layerType: PropTypes.string,
    map: PropTypes.object,
    offset: PropTypes.array,
    position: PropTypes.array,
    selectedIds: PropTypes.array,
}

export default connect(
    ({ contextMenu, map, selection }) => ({
        ...contextMenu,
        earthEngineLayers: map.mapViews.filter(
            (view) => view.layer === EARTH_ENGINE_LAYER
        ),
        selectedIds:
            selection.layerId === contextMenu?.layerConfig?.id
                ? selection.ids
                : [],
    }),
    {
        closeContextMenu,
        highlightFeature,
        openCoordinatePopup,
        showEarthEngineValue,
        setFeatureProfile,
        setOrgUnitProfile,
        updateLayer,
    }
)(ContextMenu)
