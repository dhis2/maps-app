import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import Popover from 'material-ui/Popover';
import Menu, { MenuItem } from 'material-ui/Menu';
import SvgIcon from 'd2-ui/lib/svg-icon/SvgIcon';
import OrgUnitDialog from '../orgunits/OrgUnitDialog';
import RelocateDialog from '../orgunits/RelocateDialog';
import { closeContextMenu, openCoordinatePopup, showEarthEngineValue } from '../../actions/map';
import { drillLayer } from '../../actions/layers';
import { loadOrgUnit, startRelocateOrgUnit, changeOrgUnitCoordinate} from '../../actions/orgUnits';

// https://github.com/callemall/material-ui/issues/2866
const anchorEl = document.getElementById('context-menu');

const styles = {
    list: {
        paddingTop: 4,
        paddingBottom: 4,
    },
    menuItem: {
        fontSize: 12,
        lineHeight: '24px',
        minHeight: '24px',
    },

    menuItemInner: {
        padding: '0 8px 0 34px',
    },
    icon: {
        margin: 3,
        left: 6,
        width: 18,
        height: 18,
    }
};

const ContextMenu = (props, context) => {
    const { feature, layerType, earthEngineLayers } = props;
    const isAdmin = context.d2.currentUser.authorities.has('F_GIS_ADMIN');
    const iconColor = '#777';
    const iconDisabledColor = '#eee';
    let isPoint;
    let attr = {};

    if (props.position) {
        anchorEl.style.left = props.position[0] + 'px';
        anchorEl.style.top = props.position[1] + 'px';
    }

    if (feature) {
        isPoint = feature.geometry.type === 'Point';
        attr = feature.properties;
    }

    return [
        <Popover
            key='popover'
            open={props.position ? true : false}
            anchorEl={anchorEl}
            onRequestClose={props.onClose}
        >
            <Menu autoWidth={true} style={styles.menu} listStyle={styles.list} menuItemStyle={styles.menuItem}>
                {layerType !== 'facility' && feature &&
                    <MenuItem
                        disabled={!attr.hasCoordinatesUp}
                        onClick={() => props.onDrill(props.layerId, attr.grandParentId, attr.grandParentParentGraph, parseInt(attr.level) - 1)}
                        leftIcon={
                            <SvgIcon
                                icon='ArrowUpward'
                                color={attr.hasCoordinatesUp ? iconColor : iconDisabledColor}
                                style={styles.icon}
                            />
                        }
                        innerDivStyle={styles.menuItemInner}
                    >{i18next.t('Drill up one level')}</MenuItem>
                }

                {layerType !== 'facility' && feature &&
                    <MenuItem
                        disabled={!attr.hasCoordinatesDown}
                        onClick={() => props.onDrill(props.layerId, attr.id, attr.parentGraph, parseInt(attr.level) + 1)}
                        leftIcon={
                            <SvgIcon
                                icon='ArrowDownward'
                                color={attr.hasCoordinatesDown ? iconColor : iconDisabledColor}
                                style={styles.icon}
                            />
                        }
                        innerDivStyle={styles.menuItemInner}
                    >{i18next.t('Drill down one level')}</MenuItem>
                }

                {isAdmin && isPoint &&
                    <MenuItem
                        onClick={() => props.onRelocateStart(props.layerId, feature)}
                        leftIcon={
                            <SvgIcon
                                icon='Room'
                                style={styles.icon}
                            />
                        }
                        innerDivStyle={styles.menuItemInner}
                    >{i18next.t('Relocate')}</MenuItem>
                }

                {isAdmin && isPoint &&
                    <MenuItem
                        onClick={() => props.onSwapCoordinate(props.layerId, feature.id, feature.geometry.coordinates.slice(0).reverse())}
                        leftIcon={
                            <SvgIcon
                                icon='Room'
                                style={styles.icon}
                            />
                        }
                        innerDivStyle={styles.menuItemInner}
                    >{i18next.t('Swap longitude/latitude')}</MenuItem>
                }

                {feature && false &&
                    <MenuItem
                        onClick={() => props.onShowInformation(attr)}
                        innerDivStyle={styles.menuItemInner}
                        leftIcon={
                            <SvgIcon
                                icon='InfoOutline'
                                style={styles.icon}
                            />
                        }
                    >{i18next.t('Show information')}</MenuItem>
                }

                {earthEngineLayers.map((layer) =>
                    <MenuItem
                        key={layer.id}
                        onClick={() => props.showEarthEngineValue(layer.id, props.coordinate)}
                        innerDivStyle={styles.menuItemInner}
                        leftIcon={
                            <SvgIcon
                                icon='Room'
                                style={styles.icon}
                            />
                        }
                    >{i18next.t(layer.name)}</MenuItem>)
                }

                {props.coordinate && !isPoint &&
                    <MenuItem
                        onClick={() => props.showCoordinate(props.coordinate)}
                        leftIcon={
                            <SvgIcon
                                icon='Room'
                                style={styles.icon}
                            />
                        }
                        innerDivStyle={styles.menuItemInner}
                    >{i18next.t('Show longitude/latitude')}</MenuItem>
                }
            </Menu>
        </Popover>,
        <OrgUnitDialog key='orgunit' />,
        <RelocateDialog key='relocate' />,
    ];
};

ContextMenu.contextTypes = {
    d2: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
    ...state.contextMenu,
    earthEngineLayers: state.map.mapViews.filter(view => view.layer === 'earthEngine'),
});

const mapDispatchToProps = (dispatch) => ({
    onClose: () => dispatch(closeContextMenu()),
    onDrill: (layerId, parentId, parentGraph, level) => dispatch(drillLayer(layerId, parentId, parentGraph, level)),
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
