import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import RoomIcon from '@material-ui/icons/Room';
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

// https://github.com/callemall/material-ui/issues/2866
const anchorEl = document.getElementById('context-menu');

const styles = {
    menuItem: {
        padding: '0 8px',
    },
    icon: {
        margin: '0 3px',
        left: 6,
        width: 18,
        height: 18,
    },
    text: {
        fontSize: 12,
        padding: '0 8px',
    },
};

const ContextMenu = (props, context) => {
    const {
        feature,
        layerId,
        layerType,
        coordinates,
        earthEngineLayers,
        position,
        onClose,
        onDrill,
        onShowInformation,
        showCoordinate,
        onSwapCoordinate,
        onRelocateStart,
        showEarthEngineValue,
        classes,
        theme,
    } = props;

    const isAdmin = context.d2.currentUser.authorities.has('F_GIS_ADMIN');
    const iconColor = theme.colors.greyBlack;
    const iconDisabledColor = theme.colors.greyLight;
    let isPoint;
    let attr = {};

    if (position) {
        anchorEl.style.position = 'fixed';
        anchorEl.style.left = position[0] + 'px';
        anchorEl.style.top = position[1] + 'px';
    }

    if (feature) {
        isPoint = feature.geometry.type === 'Point';
        attr = feature.properties;
    }

    return [
        <Menu
            key="menu"
            open={position ? true : false}
            anchorEl={anchorEl}
            onClose={onClose}
        >
            {layerType !== 'facility' && feature && (
                <MenuItem
                    disabled={!attr.hasCoordinatesUp}
                    onClick={() =>
                        onDrill(
                            layerId,
                            attr.grandParentId,
                            attr.grandParentParentGraph,
                            parseInt(attr.level) - 1
                        )
                    }
                    className={classes.menuItem}
                >
                    <ListItemIcon className={classes.icon}>
                        <ArrowUpwardIcon
                            nativeColor={
                                attr.hasCoordinatesUp
                                    ? iconColor
                                    : iconDisabledColor
                            }
                            style={styles.icon}
                        />
                    </ListItemIcon>
                    <ListItemText
                        primary={i18n.t('Drill up one level')}
                        className={classes.text}
                        disableTypography={true}
                    />
                </MenuItem>
            )}

            {layerType !== 'facility' && feature && (
                <MenuItem
                    disabled={!attr.hasCoordinatesDown}
                    onClick={() =>
                        onDrill(
                            layerId,
                            attr.id,
                            attr.parentGraph,
                            parseInt(attr.level) + 1
                        )
                    }
                    className={classes.menuItem}
                >
                    <ListItemIcon className={classes.icon}>
                        <ArrowDownwardIcon
                            nativeColor={
                                attr.hasCoordinatesDown
                                    ? iconColor
                                    : iconDisabledColor
                            }
                            style={styles.icon}
                        />
                    </ListItemIcon>
                    <ListItemText
                        primary={i18n.t('Drill down one level')}
                        className={classes.text}
                        disableTypography={true}
                    />
                </MenuItem>
            )}

            {feature && (
                <MenuItem
                    onClick={() => onShowInformation(attr)}
                    className={classes.menuItem}
                >
                    <ListItemIcon className={classes.icon}>
                        <InfoOutlinedIcon style={styles.icon} />
                    </ListItemIcon>
                    <ListItemText
                        primary={i18n.t('Show information')}
                        className={classes.text}
                        disableTypography={true}
                    />
                </MenuItem>
            )}

            {coordinates && (
                <MenuItem
                    onClick={() => showCoordinate(coordinates)}
                    className={classes.menuItem}
                >
                    <ListItemIcon className={classes.icon}>
                        <RoomIcon style={styles.icon} />
                    </ListItemIcon>
                    <ListItemText
                        primary={i18n.t('Show longitude/latitude')}
                        className={classes.text}
                        disableTypography={true}
                    />
                </MenuItem>
            )}

            {isAdmin && isPoint && (
                <MenuItem
                    onClick={() =>
                        onSwapCoordinate(
                            layerId,
                            feature.id,
                            feature.geometry.coordinates.slice(0).reverse()
                        )
                    }
                    className={classes.menuItem}
                >
                    <ListItemIcon className={classes.icon}>
                        <RoomIcon style={styles.icon} />
                    </ListItemIcon>
                    <ListItemText
                        primary={i18n.t('Swap longitude/latitude')}
                        className={classes.text}
                        disableTypography={true}
                    />
                </MenuItem>
            )}

            {isAdmin && isPoint && (
                <MenuItem
                    onClick={() => onRelocateStart(layerId, feature)}
                    className={classes.menuItem}
                >
                    <ListItemIcon className={classes.icon}>
                        <RoomIcon style={styles.icon} />
                    </ListItemIcon>
                    <ListItemText
                        primary={i18n.t('Relocate')}
                        className={classes.text}
                        disableTypography={true}
                    />
                </MenuItem>
            )}

            {earthEngineLayers.map(layer => (
                <MenuItem
                    key={layer.id}
                    onClick={() => showEarthEngineValue(layer.id, coordinates)}
                    className={classes.menuItem}
                >
                    <ListItemIcon className={classes.icon}>
                        <RoomIcon style={styles.icon} />
                    </ListItemIcon>
                    <ListItemText
                        primary={i18n.t(layer.name)}
                        className={classes.text}
                        disableTypography={true}
                    />
                </MenuItem>
            ))}
        </Menu>,
        <OrgUnitDialog key="orgunit" />,
        <RelocateDialog key="relocate" />,
    ];
};

ContextMenu.contextTypes = {
    d2: PropTypes.object.isRequired,
};

ContextMenu.propTypes = {
    feature: PropTypes.object,
    layerType: PropTypes.string,
    coordinate: PropTypes.array,
    position: PropTypes.array,
    earthEngineLayers: PropTypes.array,
    onClose: PropTypes.func.isRequired,
    onDrill: PropTypes.func.isRequired,
    onShowInformation: PropTypes.func.isRequired,
    showCoordinate: PropTypes.func.isRequired,
    onRelocateStart: PropTypes.func.isRequired,
    onSwapCoordinate: PropTypes.func.isRequired,
    showEarthEngineValue: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
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

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(
    withStyles(styles, {
        withTheme: true,
    })(ContextMenu)
);
