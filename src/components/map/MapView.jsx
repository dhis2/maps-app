import { useCachedDataQuery } from '@dhis2/analytics'
import { useDataEngine, useConfig } from '@dhis2/app-runtime'
import { ComponentCover, CenteredContent, CircularLoader } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useMemo } from 'react'
import { getSplitViewLayer } from '../../util/helpers.js'
import { getMapControls } from '../../util/mapControls.js'
import Map from './Map.jsx'
import SplitView from './SplitView.jsx'

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
        openContextMenu,
        setMapObject,
        resizeCount,
        ...layerDispatchActions
    } = props

    const { baseUrl } = useConfig()
    const engine = useDataEngine()
    const { currentUser } = useCachedDataQuery()
    const nameProperty = currentUser.keyAnalysisDisplayProperty

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
                            openContextMenu={openContextMenu}
                            resizeCount={resizeCount}
                            setMapObject={setMapObject}
                            baseUrl={baseUrl}
                            engine={engine}
                            nameProperty={nameProperty}
                            {...layerDispatchActions}
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
    controls: PropTypes.array,
    coordinatePopup: PropTypes.array,
    feature: PropTypes.object,
    interpretationModalOpen: PropTypes.bool,
    isFullscreen: PropTypes.bool,
    isPlugin: PropTypes.bool,
    layers: PropTypes.array,
    openContextMenu: PropTypes.func,
    resizeCount: PropTypes.number,
    setMapObject: PropTypes.func,
}

export default MapView
