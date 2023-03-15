import React, {useEffect} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setLayerLoading, updateLayer } from '../../actions/layers.js'
import LayerLoader from './LayerLoader.js'

const LayersLoader = () => {
    const layers = useSelector((state) =>
        state.map.mapViews.filter(
            (layer) =>
                !layer.isLoaded && !layer.isLoading || (layer.showDataTable && !layer.isExtended)
        )
    )
    const dispatch = useDispatch()

    const onLoad = (layer) => dispatch(updateLayer(layer))

    if (!layers.length) {
        return null
    }

    useEffect(() => {
        layers.forEach(layer => dispatch(setLayerLoading(layer.id)))     
     }, [layers, dispatch]);

    return layers.map((config) => (
        <LayerLoader key={config.id} config={config} onLoad={onLoad} />
    ))
}

export default LayersLoader
