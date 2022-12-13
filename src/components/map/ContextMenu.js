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
import { drillLayer } from '../../actions/layers.js'
import {
    closeContextMenu,
    openCoordinatePopup,
    showEarthEngineValue,
} from '../../actions/map.js'
import { setOrgUnitProfile } from '../../actions/orgUnits.js'
import { FACILITY_LAYER, EARTH_ENGINE_LAYER } from '../../constants/layers.js'
import styles from './styles/ContextMenu.module.css'

const ContextMenu = (props) => {
    const anchorRef = useRef()

    const {
        feature,
        layerId,
        layerType,
        coordinates,
        earthEngineLayers,
        position,
        offset,
        closeContextMenu,
        openCoordinatePopup,
        showEarthEngineValue,
        drillLayer,
        setOrgUnitProfile,
    } = props

    if (!position) {
        return null
    }

    const left = offset[0] + position[0]
    const top = offset[1] + position[1]

    const attr = feature?.properties || {}

    const onClick = (item, id) => {
        closeContextMenu()

        switch (item) {
            case 'drill_up':
                drillLayer(
                    layerId,
                    attr.grandParentId,
                    attr.grandParentParentGraph,
                    parseInt(attr.level) - 1
                )
                break
            case 'drill_down':
                drillLayer(
                    layerId,
                    attr.id,
                    attr.parentGraph,
                    parseInt(attr.level) + 1
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
                    <Menu dense>
                        {layerType !== FACILITY_LAYER && feature && (
                            <MenuItem
                                label={i18n.t('Drill up one level')}
                                icon={<IconArrowUp16 />}
                                disabled={!attr.hasCoordinatesUp}
                                onClick={() => onClick('drill_up')}
                            />
                        )}

                        {layerType !== FACILITY_LAYER && feature && (
                            <MenuItem
                                label={i18n.t('Drill down one level')}
                                icon={<IconArrowDown16 />}
                                disabled={!attr.hasCoordinatesDown}
                                onClick={() => onClick('drill_down')}
                            />
                        )}

                        {feature && (
                            <MenuItem
                                label={i18n.t('View profile')}
                                icon={<IconInfo16 />}
                                onClick={() => onClick('show_info')}
                            />
                        )}

                        {coordinates && (
                            <MenuItem
                                label={i18n.t('Show longitude/latitude')}
                                icon={<IconLocation16 />}
                                onClick={() => onClick('show_coordinate')}
                            />
                        )}

                        {earthEngineLayers.map((layer) => (
                            <MenuItem
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
    drillLayer: PropTypes.func.isRequired,
    openCoordinatePopup: PropTypes.func.isRequired,
    setOrgUnitProfile: PropTypes.func.isRequired,
    showEarthEngineValue: PropTypes.func.isRequired,
    coordinates: PropTypes.array,
    earthEngineLayers: PropTypes.array,
    feature: PropTypes.object,
    layerId: PropTypes.string,
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
    }),
    {
        closeContextMenu,
        openCoordinatePopup,
        showEarthEngineValue,
        drillLayer,
        setOrgUnitProfile,
    }
)(ContextMenu)
