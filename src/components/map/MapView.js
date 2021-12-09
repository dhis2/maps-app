import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { Layer, CenteredContent, CircularLoader } from '@dhis2/ui';
import Map from './Map';
import SplitView from './SplitView';
import { getSplitViewLayer } from '../../util/helpers';
import { getMapControls } from '../../util/mapControls';
import { useSystemSettings } from '../../hooks/SystemSettingsProvider';

// Shared component between app and plugin
const MapView = props => {
    const {
        isPlugin,
        isFullscreen,
        layers,
        controls,
        feature,
        bounds,
        coordinatePopup,
        closeCoordinatePopup,
        openContextMenu,
        setAggregations,
        resizeCount,
    } = props;

    const [basemap, setBasemap] = useState({});
    const { systemSettings } = useSystemSettings();

    useEffect(() => {
        const mybasemap = Object.assign(
            {},
            { id: systemSettings.keyDefaultBaseMap },
            props.basemap
        );

        const thebasemap = props.basemaps.find(({ id }) => id === mybasemap.id);
        setBasemap(Object.assign({}, thebasemap, mybasemap));
    }, [systemSettings.keyDefaultBaseMap, props.basemap, props.basemaps]);

    if (!basemap.id) {
        return null;
    }

    const splitViewLayer = getSplitViewLayer(layers);
    const isSplitView = !!splitViewLayer;
    const mapControls = getMapControls(isPlugin, isSplitView, controls);

    return (
        <>
            {isSplitView ? (
                <SplitView
                    isPlugin={isPlugin}
                    isFullscreen={isFullscreen}
                    basemap={basemap}
                    layer={splitViewLayer}
                    controls={mapControls}
                    feature={feature}
                    openContextMenu={openContextMenu}
                    resizeCount={resizeCount}
                />
            ) : (
                <Map
                    isPlugin={isPlugin}
                    isFullscreen={isFullscreen}
                    basemap={basemap}
                    layers={[...layers].reverse()}
                    bounds={bounds}
                    controls={mapControls}
                    feature={feature}
                    coordinatePopup={coordinatePopup}
                    closeCoordinatePopup={closeCoordinatePopup}
                    openContextMenu={openContextMenu}
                    setAggregations={setAggregations}
                    resizeCount={resizeCount}
                />
            )}
        </>
    );
};

MapView.propTypes = {
    isPlugin: PropTypes.bool,
    isFullscreen: PropTypes.bool,
    basemap: PropTypes.object,
    basemaps: PropTypes.array,
    layers: PropTypes.array,
    controls: PropTypes.array,
    feature: PropTypes.object,
    bounds: PropTypes.array,
    coordinatePopup: PropTypes.array,
    closeCoordinatePopup: PropTypes.func,
    openContextMenu: PropTypes.func,
    setAggregations: PropTypes.func,
    resizeCount: PropTypes.number,
};

export default connect(state => ({
    basemap: state.map.basemap,
    basemaps: state.basemaps,
}))(MapView);
