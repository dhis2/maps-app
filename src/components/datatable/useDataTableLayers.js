import { useSelector } from 'react-redux'
import { DATA_TABLE_LAYER_TYPES } from '../../constants/layers.js'

// Layers that can be shown in the data table, ordered as in the layer
// panel (topmost first). mapViews is stored bottom-up.
export const useDataTableLayers = () => {
    const mapViews = useSelector((state) => state.map.mapViews)
    const activeLayerId = useSelector((state) => state.dataTable)

    const layers = mapViews
        .filter((l) => DATA_TABLE_LAYER_TYPES.includes(l.layer))
        .slice()
        .reverse()

    const activeLayer = layers.find((l) => l.id === activeLayerId)

    return { layers, activeLayer }
}
