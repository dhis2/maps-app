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
        resizeCount,
    } = props;

    const splitViewLayer = getSplitViewLayer(layers);

    return (
        <Fragment>
            {splitViewLayer ? (
                <SplitView
                    layer={splitViewLayer}
                    basemap={basemap}
                    controls={
                        isPlugin
                            ? pluginControls.map(c => ({
                                  ...c,
                                  isSplitView: true,
                              }))
                            : splitViewControls
                    }
                    openContextMenu={openContextMenu}
                    resizeCount={resizeCount}
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
                    resizeCount={resizeCount}
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
    resizeCount: PropTypes.number,
};

export default MapView;
