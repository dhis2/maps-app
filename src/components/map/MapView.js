import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { ComponentCover, CenteredContent, CircularLoader } from '@dhis2/ui';
import Map from './Map';
import SplitView from './SplitView';
import { getSplitViewLayer } from '../../util/helpers';
import { getMapControls } from '../../util/mapControls';

// Shared component between app and plugin
const MapView = props => {
    const {
        isPlugin,
        isFullscreen,
        basemap,
        layers,
        controls,
        feature,
        bounds,
        coordinatePopup,
        closeCoordinatePopup,
        openContextMenu,
        setAggregations,
        resizeCount,
        restoreCount,
    } = props;

    const splitViewLayer = getSplitViewLayer(layers);
    const isSplitView = !!splitViewLayer;
    const mapControls = useMemo(
        () => getMapControls(isPlugin, isSplitView, controls),
        [isPlugin, isSplitView, controls]
    );

    return (
        <>
            {basemap.id === undefined ? (
                <ComponentCover>
                    <CenteredContent>
                        <CircularLoader />
                    </CenteredContent>
                </ComponentCover>
            ) : (
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
                            restoreCount={restoreCount}
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
                            restoreCount={restoreCount}
                        />
                    )}
                </>
            )}
        </>
    );
};

MapView.propTypes = {
    isPlugin: PropTypes.bool,
    isFullscreen: PropTypes.bool,
    basemap: PropTypes.object,
    layers: PropTypes.array,
    controls: PropTypes.array,
    feature: PropTypes.object,
    bounds: PropTypes.array,
    coordinatePopup: PropTypes.array,
    closeCoordinatePopup: PropTypes.func,
    openContextMenu: PropTypes.func,
    setAggregations: PropTypes.func,
    resizeCount: PropTypes.number,
    restoreCount: PropTypes.number,
};

export default MapView;
