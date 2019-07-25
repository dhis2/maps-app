import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Map from './Map';
import SplitView from './SplitView';
import { getSplitViewLayer } from '../../util/helpers';
import {
    mapControls,
    splitViewControls,
    pluginControls,
} from '../../constants/mapControls';

// Shared component between app and plugin
const MapView = props => {
    const {
        isPlugin,
        basemap,
        layers,
        bounds,
        coordinatePopup,
        closeCoordinatePopup,
        openContextMenu,
        onCloseContextMenu,
    } = props;

    const splitViewLayer = getSplitViewLayer(layers);

    return (
        <Fragment>
            {splitViewLayer ? (
                <SplitView
                    layer={splitViewLayer}
                    basemap={basemap}
                    controls={isPlugin ? pluginControls : splitViewControls}
                    openContextMenu={openContextMenu}
                />
            ) : (
                <Map
                    isPlugin={isPlugin}
                    basemap={basemap}
                    layers={[...layers].reverse()}
                    bounds={bounds}
                    controls={isPlugin ? pluginControls : mapControls}
                    coordinatePopup={coordinatePopup}
                    closeCoordinatePopup={closeCoordinatePopup}
                    openContextMenu={openContextMenu}
                    onCloseContextMenu={onCloseContextMenu}
                />
            )}
        </Fragment>
    );
};

MapView.propTypes = {
    isPlugin: PropTypes.bool,
    basemap: PropTypes.object,
    layers: PropTypes.array,
    bounds: PropTypes.array,
    coordinatePopup: PropTypes.array,
    closeCoordinatePopup: PropTypes.func,
    openContextMenu: PropTypes.func,
    onCloseContextMenu: PropTypes.func,
};

export default MapView;
