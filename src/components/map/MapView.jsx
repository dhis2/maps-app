import { useDataEngine, useConfig } from '@dhis2/app-runtime'
import { ComponentCover, CenteredContent, CircularLoader } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useMemo } from 'react'
import { getSplitViewLayers } from '../../util/helpers.js'
import { getMapControls } from '../../util/mapControls.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
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
        selection,
        highlightFeature,
        highlightColor,
        showOnlySelected,
        clickFeature,
        toggleFeatureSelection,
        bounds,
        coordinatePopup,
        interpretationModalOpen,
        openContextMenu,
        setMapObject,
        resizeCount,
        layersSorting,
        ...layerDispatchActions
    } = props

    const { baseUrl } = useConfig()
    const engine = useDataEngine()
    const { currentUser } = useCachedData()
    const nameProperty = currentUser.keyAnalysisDisplayProperty

    const splitViewLayers = getSplitViewLayers(layers)
    const isSplitView = splitViewLayers.length > 0
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
                            layers={splitViewLayers.reverse()}
                            controls={mapControls}
                            feature={feature}
                            selection={selection}
                            highlightFeature={highlightFeature}
                            highlightColor={highlightColor}
                            showOnlySelected={showOnlySelected}
                            clickFeature={clickFeature}
                            toggleFeatureSelection={toggleFeatureSelection}
                            interpretationModalOpen={interpretationModalOpen}
                            openContextMenu={openContextMenu}
                            resizeCount={resizeCount}
                            setMapObject={setMapObject}
                            layersSorting={layersSorting}
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
                            selection={selection}
                            highlightFeature={highlightFeature}
                            highlightColor={highlightColor}
                            showOnlySelected={showOnlySelected}
                            clickFeature={clickFeature}
                            toggleFeatureSelection={toggleFeatureSelection}
                            coordinatePopup={coordinatePopup}
                            openContextMenu={openContextMenu}
                            resizeCount={resizeCount}
                            setMapObject={setMapObject}
                            baseUrl={baseUrl}
                            engine={engine}
                            nameProperty={nameProperty}
                            layersSorting={layersSorting}
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
    clickFeature: PropTypes.func,
    controls: PropTypes.array,
    coordinatePopup: PropTypes.array,
    feature: PropTypes.object,
    highlightColor: PropTypes.string,
    highlightFeature: PropTypes.func,
    interpretationModalOpen: PropTypes.bool,
    isFullscreen: PropTypes.bool,
    isPlugin: PropTypes.bool,
    layers: PropTypes.array,
    layersSorting: PropTypes.bool,
    openContextMenu: PropTypes.func,
    resizeCount: PropTypes.number,
    selection: PropTypes.object,
    setMapObject: PropTypes.func,
    showOnlySelected: PropTypes.bool,
    toggleFeatureSelection: PropTypes.func,
}

export default MapView
