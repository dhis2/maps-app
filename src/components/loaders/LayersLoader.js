import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setLayerLoading, updateLayer } from '../../actions/layers.js'
import LayerLoader from './LayerLoader.js'

const LayersLoader = () => {
    const layers = useSelector((state) => {
        return state.map.mapViews.filter((layer) => {
            // The layer is currently being loaded - don't load again
            if (layer.isLoading) {
                return false
            } else {
                // The layer is not loaded - load it
                if (!layer.isLoaded) {
                    return true
                }

                // The layer is loaded but the data table is now displayed and
                // event extended data hasn't been loaded yet - so load it
                if (layer.showDataTable && !layer.isExtended) {
                    return true
                }

                return false
            }
        })
    })
    const dispatch = useDispatch()

    const onLoad = (layer) => dispatch(updateLayer(layer))

    useEffect(() => {
        layers.forEach((layer) => dispatch(setLayerLoading(layer.id)))
    }, [layers, dispatch])

    if (!layers.length) {
        return null
    }

    return layers.map((config) => (
        <LayerLoader key={config.id} config={config} onLoad={onLoad} />
    ))
}

export default LayersLoader
