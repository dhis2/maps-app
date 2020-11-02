import React, { Fragment, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { Popover, Menu, MenuItem } from '@dhis2/ui';
import UpIcon from '@material-ui/icons/ArrowUpward';
import DownIcon from '@material-ui/icons/ArrowDownward';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import PositionIcon from '@material-ui/icons/Room';
import OrgUnitDialog from '../orgunits/OrgUnitDialog';
import RelocateDialog from '../orgunits/RelocateDialog';
import {
    closeContextMenu,
    openCoordinatePopup,
    showEarthEngineValue,
} from '../../actions/map';
import { drillLayer } from '../../actions/layers';
import {
    loadOrgUnit,
    startRelocateOrgUnit,
    changeOrgUnitCoordinate,
} from '../../actions/orgUnits';
import styles from './styles/ContextMenu.module.css';

// https://github.com/callemall/material-ui/issues/2866
const anchorEl = document.getElementById('context-menu');

const polygonTypes = ['Polygon', 'MultiPolygon'];

const ContextMenu = (props, context) => {
    const {
        feature,
        layerId,
        layerType,
        coordinates,
        earthEngineLayers,
        position,
        offset,
        onClose,
        onDrill,
        onShowInformation,
        showCoordinate,
        onSwapCoordinate,
        onRelocateStart,
        showEarthEngineValue,
    } = props;

    if (!position) {
        return null;
    }

    const anchorRef = useRef();
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
                onClickOutside={onClose}
            >
                <div className={styles.menu}>
                    <Menu dense anchorEl={anchorEl}>
                        {layerType !== 'facility' && feature && (
                            <MenuItem
                                label={i18n.t('Drill up one level')}
                                icon={<UpIcon />}
                                disabled={!attr.hasCoordinatesUp}
                                onClick={() =>
                                    onDrill(
                                        layerId,
                                        attr.grandParentId,
                                        attr.grandParentParentGraph,
                                        parseInt(attr.level) - 1
                                    )
                                }
                            />
                        )}

                        {layerType !== 'facility' && feature && (
                            <MenuItem
                                label={i18n.t('Drill down one level')}
                                icon={<DownIcon />}
                                disabled={!attr.hasCoordinatesDown}
                                onClick={() =>
                                    onDrill(
                                        layerId,
                                        attr.id,
                                        attr.parentGraph,
                                        parseInt(attr.level) + 1
                                    )
                                }
                            />
                        )}

                        {feature && (
                            <MenuItem
                                label={i18n.t('Show information')}
                                icon={<InfoIcon />}
                                onClick={() => onShowInformation(attr)}
                            />
                        )}

                        {coordinates && (
                            <MenuItem
                                label={i18n.t('Show longitude/latitude')}
                                icon={<PositionIcon />}
                                onClick={() => showCoordinate(coordinates)}
                            />
                        )}

                        {isAdmin && isPoint && (
                            <MenuItem
                                label={i18n.t('Swap longitude/latitude')}
                                icon={<PositionIcon />}
                                onClick={() =>
                                    onSwapCoordinate(
                                        layerId,
                                        feature.id,
                                        feature.geometry.coordinates
                                            .slice(0)
                                            .reverse()
                                    )
                                }
                            />
                        )}

                        {isAdmin && isPoint && (
                            <MenuItem
                                label={i18n.t('Relocate')}
                                icon={<PositionIcon />}
                                onClick={() =>
                                    onRelocateStart(layerId, feature)
                                }
                            />
                        )}

                        {earthEngineLayers.map(layer => (
                            <MenuItem
                                key={layer.id}
                                label={i18n.t(layer.name)}
                                icon={<PositionIcon />}
                                onClick={() =>
                                    showEarthEngineValue(layer.id, coordinates)
                                }
                            />
                        ))}
                    </Menu>
                </div>
            </Popover>
            <OrgUnitDialog key="orgunit" />
            <RelocateDialog key="relocate" />
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
    earthEngineLayers: PropTypes.array,
    onClose: PropTypes.func.isRequired,
    onDrill: PropTypes.func.isRequired,
    onShowInformation: PropTypes.func.isRequired,
    showCoordinate: PropTypes.func.isRequired,
    onRelocateStart: PropTypes.func.isRequired,
    onSwapCoordinate: PropTypes.func.isRequired,
    showEarthEngineValue: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    ...state.contextMenu,
    earthEngineLayers: state.map.mapViews.filter(
        view => view.layer === 'earthEngine'
    ),
});

const mapDispatchToProps = dispatch => ({
    onClose: () => dispatch(closeContextMenu()),
    onDrill: (layerId, parentId, parentGraph, level) =>
        dispatch(drillLayer(layerId, parentId, parentGraph, level)),
    onShowInformation: attr => {
        dispatch(closeContextMenu());
        dispatch(loadOrgUnit(attr));
    },
    showCoordinate: coord => {
        dispatch(closeContextMenu());
        dispatch(openCoordinatePopup(coord));
    },
    onRelocateStart: (layerId, feature) => {
        dispatch(closeContextMenu());
        dispatch(startRelocateOrgUnit(layerId, feature));
    },
    onSwapCoordinate: (layerId, featureId, coordinate) => {
        dispatch(closeContextMenu());
        dispatch(changeOrgUnitCoordinate(layerId, featureId, coordinate));
    },
    showEarthEngineValue: (layerId, coordinate) => {
        dispatch(closeContextMenu());
        dispatch(showEarthEngineValue(layerId, coordinate));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(ContextMenu);
