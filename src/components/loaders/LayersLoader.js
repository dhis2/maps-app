import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setLayerLoading, updateLayer } from '../../actions/layers.js'
import { EVENT_LAYER } from '../../constants/layers.js'
import LayerLoader from './LayerLoader.js'

const LayersLoader = () => {
    const dataTable = useSelector((state) => state.dataTable)
    const layersToLoad = useSelector(({ map }) =>
        map.mapViews.filter(
            ({
                id,
                isLoading,
                isLoaded,
                isExtended,
                layer: layerType,
                serverCluster,
            }) => {
                // The layer is currently being loaded - don't load again
                if (isLoading) {
                    return false
                } else {
                    // The layer is not loaded - load it
                    if (!isLoaded) {
                        return true
                    }

                    // The layer is loaded but the data table is now displayed and
                    // event extended data hasn't been loaded yet - so load it
                    if (
                        layerType === EVENT_LAYER &&
                        id === dataTable &&
                        !isExtended &&
                        !serverCluster
                    ) {
                        return true
                    }

                    return false
                }
            }
        )
    )
    const dispatch = useDispatch()

    const onLoad = (layer) => dispatch(updateLayer(layer))

    useEffect(() => {
        layersToLoad.forEach((layer) => dispatch(setLayerLoading(layer.id)))
    }, [layersToLoad, dispatch])

    if (!layersToLoad.length) {
        return null
    }

    return layersToLoad.map((config) => (
        <LayerLoader
            key={config.id}
            config={config}
            onLoad={onLoad}
            dataTableOpen={!!dataTable}
        />
    ))
}

export default LayersLoader
