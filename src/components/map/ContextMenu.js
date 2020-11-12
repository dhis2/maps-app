import React, { Fragment, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { Popover, Menu, MenuItem } from '@dhis2/ui';
import UpIcon from '@material-ui/icons/ArrowUpward';
import DownIcon from '@material-ui/icons/ArrowDownward';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import PositionIcon from '@material-ui/icons/Room';
import RelocateDialog from '../orgunits/RelocateDialog';
import {
    closeContextMenu,
    openCoordinatePopup,
    showEarthEngineValue,
} from '../../actions/map';
import { drillLayer } from '../../actions/layers';
import { loadOrgUnit, changeOrgUnitCoordinate } from '../../actions/orgUnits';
import styles from './styles/ContextMenu.module.css';

const polygonTypes = ['Polygon', 'MultiPolygon'];

const ContextMenu = (props, context) => {
    const [relocate, setRelocate] = useState();
    const anchorRef = useRef();

    const {
        feature,
        layerId,
        layerType,
        coordinates,
        earthEngineLayers,
        position,
        offset,
        map,
        closeContextMenu,
        openCoordinatePopup,
        showEarthEngineValue,
        drillLayer,
        loadOrgUnit,
        changeOrgUnitCoordinate,
    } = props;

    if (relocate) {
        return <RelocateDialog {...relocate} onClose={() => setRelocate()} />;
    }

    if (!position) {
        return null;
    }

    const isAdmin = context.d2.currentUser.authorities.has('F_GIS_ADMIN');
    const left = offset[0] + position[0];
    const top = offset[1] + position[1];

    let isPoint;
    let attr = {};

    if (feature) {
        const { geometry, properties } = feature;

        attr = properties || {};

        // Treat bubbles as polygons if created from one
        isPoint =
            geometry.type === 'Point' && !polygonTypes.includes(attr.type);
    }

    const onClick = (item, id) => {
        closeContextMenu();

        switch (item) {
            case 'drill_up':
                drillLayer(
                    layerId,
                    attr.grandParentId,
                    attr.grandParentParentGraph,
                    parseInt(attr.level) - 1
                );
                break;
            case 'drill_down':
                drillLayer(
                    layerId,
                    attr.id,
                    attr.parentGraph,
                    parseInt(attr.level) + 1
                );
                break;
            case 'show_info':
                loadOrgUnit(attr);
                break;
            case 'show_coordinate':
                openCoordinatePopup(coordinates);
                break;
            case 'swap_coordinate':
                changeOrgUnitCoordinate(
                    layerId,
                    feature.properties.id,
                    feature.geometry.coordinates.slice(0).reverse()
                );
                break;
            case 'relocate':
                setRelocate({ layerId, feature, map });
                break;
            case 'show_ee_value':
                showEarthEngineValue(id, coordinates);
                break;

            default:
        }
    };

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
                        {layerType !== 'facility' && feature && (
                            <MenuItem
                                label={i18n.t('Drill up one level')}
                                icon={<UpIcon />}
                                disabled={!attr.hasCoordinatesUp}
                                onClick={() => onClick('drill_up')}
                            />
                        )}

                        {layerType !== 'facility' && feature && (
                            <MenuItem
                                label={i18n.t('Drill down one level')}
                                icon={<DownIcon />}
                                disabled={!attr.hasCoordinatesDown}
                                onClick={() => onClick('drill_down')}
                            />
                        )}

                        {feature && (
                            <MenuItem
                                label={i18n.t('Show information')}
                                icon={<InfoIcon />}
                                onClick={() => onClick('show_info')}
                            />
                        )}

                        {coordinates && (
                            <MenuItem
                                label={i18n.t('Show longitude/latitude')}
                                icon={<PositionIcon />}
                                onClick={() => onClick('show_coordinate')}
                            />
                        )}

                        {isAdmin && isPoint && (
                            <MenuItem
                                label={i18n.t('Swap longitude/latitude')}
                                icon={<PositionIcon />}
                                onClick={() => onClick('swap_coordinate')}
                            />
                        )}

                        {isAdmin && isPoint && (
                            <MenuItem
                                label={i18n.t('Relocate')}
                                icon={<PositionIcon />}
                                onClick={() => onClick('relocate')}
                            />
                        )}

                        {earthEngineLayers.map(layer => (
                            <MenuItem
                                key={layer.id}
                                label={i18n.t('Show {{name}}', {
                                    name: layer.name.toLowerCase(),
                                })}
                                icon={<PositionIcon />}
                                onClick={() =>
                                    onClick('show_ee_value', layer.id)
                                }
                            />
                        ))}
                    </Menu>
                </div>
            </Popover>
        </Fragment>
    );
};

ContextMenu.contextTypes = {
    d2: PropTypes.object.isRequired,
};

ContextMenu.propTypes = {
    feature: PropTypes.object,
    layerType: PropTypes.string,
    layerId: PropTypes.string,
    coordinates: PropTypes.array,
    position: PropTypes.array,
    offset: PropTypes.array,
    map: PropTypes.object,
    earthEngineLayers: PropTypes.array,
    closeContextMenu: PropTypes.func.isRequired,
    openCoordinatePopup: PropTypes.func.isRequired,
    showEarthEngineValue: PropTypes.func.isRequired,
    drillLayer: PropTypes.func.isRequired,
    loadOrgUnit: PropTypes.func.isRequired,
    changeOrgUnitCoordinate: PropTypes.func.isRequired,
};

export default connect(
    ({ contextMenu, map }) => ({
        ...contextMenu,
        earthEngineLayers: map.mapViews.filter(
            view => view.layer === 'earthEngine'
        ),
    }),
    {
        closeContextMenu,
        openCoordinatePopup,
        showEarthEngineValue,
        drillLayer,
        loadOrgUnit,
        changeOrgUnitCoordinate,
    }
)(ContextMenu);
