import i18n from '@dhis2/d2-i18n'
import {
    Popover,
    Menu,
    MenuItem,
    IconArrowUp16,
    IconArrowDown16,
    IconInfo16,
    IconLocation16,
    IconAdd16,
    IconEdit16,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { Fragment, useRef } from 'react'
import { connect } from 'react-redux'
import { updateLayer } from '../../actions/layers.js'
import {
    closeContextMenu,
    openCoordinatePopup,
    showEarthEngineValue,
} from '../../actions/map.js'
import { setOrgUnitProfile } from '../../actions/orgUnits.js'
import { openOsmFeatureForm, startOsmDrawing } from '../../actions/osmEdit.js'
import {
    FACILITY_LAYER,
    EARTH_ENGINE_LAYER,
    RENDERING_STRATEGY_SPLIT_BY_PERIOD,
} from '../../constants/layers.js'
import { isSplitViewMap } from '../../util/helpers.js'
import { drillUpDown } from '../../util/map.js'
import styles from './styles/ContextMenu.module.css'

const ContextMenu = (props) => {
    const anchorRef = useRef()

    const {
        feature,
        layerType,
        layerConfig,
        coordinates,
        earthEngineLayers,
        isSplitView: isSplitViewLayout,
        position,
        offset,
        closeContextMenu,
        openCoordinatePopup,
        showEarthEngineValue,
        setOrgUnitProfile,
        updateLayer,
        openOsmFeatureForm,
        startOsmDrawing,
    } = props

    if (!position) {
        return null
    }

    const isSplitView =
        layerConfig?.renderingStrategy === RENDERING_STRATEGY_SPLIT_BY_PERIOD

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
                setOrgUnitProfile(attr.id)
                break
            case 'show_coordinate':
                openCoordinatePopup(coordinates)
                break
            case 'show_ee_value':
                showEarthEngineValue(id, coordinates)
                break
            // The category is picked in the form
            case 'add_osm_feature':
                openOsmFeatureForm(null, { type: 'Point', coordinates })
                break
            case 'draw_osm_line':
                startOsmDrawing(null, coordinates)
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
                        {layerType !== FACILITY_LAYER && feature && (
                            <MenuItem
                                dataTest="context-menu-drill-up"
                                label={i18n.t('Drill up one level')}
                                icon={<IconArrowUp16 />}
                                disabled={!attr.hasCoordinatesUp}
                                onClick={() => onClick('drill_up')}
                            />
                        )}

                        {layerType !== FACILITY_LAYER && feature && (
                            <MenuItem
                                dataTest="context-menu-drill-down"
                                label={i18n.t('Drill down one level')}
                                icon={<IconArrowDown16 />}
                                disabled={!attr.hasCoordinatesDown}
                                onClick={() => onClick('drill_down')}
                            />
                        )}

                        {feature && (
                            <MenuItem
                                dataTest="context-menu-view-profile"
                                label={i18n.t('View profile')}
                                icon={<IconInfo16 />}
                                onClick={() => onClick('show_info')}
                            />
                        )}

                        {coordinates && !isSplitView && (
                            <MenuItem
                                dataTest="context-menu-show-long-lat"
                                label={i18n.t('Show longitude/latitude')}
                                icon={<IconLocation16 />}
                                onClick={() => onClick('show_coordinate')}
                            />
                        )}

                        {coordinates && !isSplitViewLayout && (
                            <MenuItem
                                dataTest="context-menu-add-osm-feature"
                                label={i18n.t('Add OSM feature here')}
                                icon={<IconAdd16 />}
                                onClick={() => onClick('add_osm_feature')}
                            />
                        )}

                        {coordinates && !isSplitViewLayout && (
                            <MenuItem
                                dataTest="context-menu-draw-osm-line"
                                label={i18n.t('Draw OSM line from here')}
                                icon={<IconEdit16 />}
                                onClick={() => onClick('draw_osm_line')}
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
    openCoordinatePopup: PropTypes.func.isRequired,
    openOsmFeatureForm: PropTypes.func.isRequired,
    setOrgUnitProfile: PropTypes.func.isRequired,
    showEarthEngineValue: PropTypes.func.isRequired,
    startOsmDrawing: PropTypes.func.isRequired,
    updateLayer: PropTypes.func.isRequired,
    coordinates: PropTypes.array,
    earthEngineLayers: PropTypes.array,
    feature: PropTypes.object,
    isSplitView: PropTypes.bool,
    layerConfig: PropTypes.object,
    layerType: PropTypes.string,
    map: PropTypes.object,
    offset: PropTypes.array,
    position: PropTypes.array,
}

export default connect(
    ({ contextMenu, map }) => ({
        ...contextMenu,
        earthEngineLayers: map.mapViews.filter(
            (view) => view.layer === EARTH_ENGINE_LAYER
        ),
        isSplitView: isSplitViewMap(map.mapViews),
    }),
    {
        closeContextMenu,
        openCoordinatePopup,
        showEarthEngineValue,
        setOrgUnitProfile,
        updateLayer,
        openOsmFeatureForm,
        startOsmDrawing,
    }
)(ContextMenu)
