import { ComponentCover, CenteredContent, CircularLoader } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useMemo } from 'react'
import { getSplitViewLayer } from '../../util/helpers.js'
import { getMapControls } from '../../util/mapControls.js'
import Map from './Map.js'
import SplitView from './SplitView.js'

// Shared component between app and plugin
const MapView = (props) => {
    const {
        isPlugin,
        isFullscreen,
        basemap,
        layers,
        controls,
        feature,
        bounds,
        coordinatePopup,
        interpretationModalOpen,
        closeCoordinatePopup,
        openContextMenu,
        setAggregations,
        setMapObject,
        resizeCount,
        showNorthArrow,
    } = props

    const splitViewLayer = getSplitViewLayer(layers)
    const isSplitView = !!splitViewLayer
    const mapControls = useMemo(
        () => getMapControls(isPlugin, isSplitView, controls),
        [isPlugin, isSplitView, controls]
    )

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
                            interpretationModalOpen={interpretationModalOpen}
                            openContextMenu={openContextMenu}
                            resizeCount={resizeCount}
                            setMapObject={setMapObject}
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
                            showNorthArrow={showNorthArrow}
                            setMapObject={setMapObject}
                        />
                    )}
                </>
            )}
        </>
    )
}

MapView.propTypes = {
    basemap: PropTypes.object,
    bounds: PropTypes.array,
    closeCoordinatePopup: PropTypes.func,
    controls: PropTypes.array,
    coordinatePopup: PropTypes.array,
    feature: PropTypes.object,
    interpretationModalOpen: PropTypes.bool,
    isFullscreen: PropTypes.bool,
    isPlugin: PropTypes.bool,
    layers: PropTypes.array,
    openContextMenu: PropTypes.func,
    resizeCount: PropTypes.number,
    setAggregations: PropTypes.func,
    setMapObject: PropTypes.func,
    showNorthArrow: PropTypes.bool,
}

export default MapView
