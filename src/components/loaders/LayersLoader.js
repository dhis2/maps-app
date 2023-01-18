import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateLayer } from '../../actions/layers.js'
import LayerLoader from './LayerLoader.js'

const LayersLoader = () => {
    const layers = useSelector((state) =>
        state.map.mapViews.filter((layer) => !layer.isLoaded)
    )
    const dispatch = useDispatch()

    const onLoad = (layer) => dispatch(updateLayer(layer))

    if (!layers.length) {
        return null
    }

    return layers.map((config) => (
        <LayerLoader key={config.id} config={config} onLoad={onLoad} />
    ))
}

export default LayersLoader
