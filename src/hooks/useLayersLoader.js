import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setLayerLoading, updateLayer } from '../actions/layers.js'
import useLoaderAlerts from '../components/loaders/useLoaderAlerts.js'
import { EVENT_LAYER } from '../constants/layers.js'
import { getHashUrlParam } from '../util/history.js'
import { getPreviewAlerts } from '../util/layerAlerts.js'
import { useLoadLayer } from './useLoadLayer.js'

// Adds the developer preview alerts (#/?alertPreview) the layer doesn't have
const withPreviewAlerts = (result) => {
    if (getHashUrlParam('alertPreview') === undefined) {
        return result
    }
    const ids = (result.alerts ?? []).map((alert) => alert.id)
    return {
        ...result,
        alerts: [
            ...(result.alerts ?? []),
            ...getPreviewAlerts().filter((alert) => !ids.includes(alert.id)),
        ],
    }
}

export const useLayersLoader = () => {
    const { loadLayer, canLoadLayer } = useLoadLayer()
    const { showAlerts } = useLoaderAlerts()
    const allLayers = useSelector((state) => state.map.mapViews)
    const dataTable = useSelector((state) => state.dataTable)
    const dispatch = useDispatch()

    useEffect(() => {
        const unloadedLayers = allLayers.filter((layer) => {
            if (layer.isLoading) {
                return false
            }
            // The layer is not loaded - load it
            if (!layer.isLoaded) {
                return true
            }
            // The layer is loaded but the data table is now displayed and
            // event extended data hasn't been loaded yet - so load it
            return (
                layer.layer === EVENT_LAYER &&
                layer.id === dataTable &&
                !layer.isExtended &&
                !layer.serverCluster
            )
        })

        unloadedLayers.filter(canLoadLayer).forEach(async (config) => {
            dispatch(setLayerLoading(config.id))
            const result = withPreviewAlerts(
                await loadLayer(config, { loadExtended: !!dataTable })
            )
            if (result.alerts) {
                showAlerts(result.alerts)
            }
            dispatch(updateLayer(result))
        })
    }, [allLayers, dataTable, dispatch, loadLayer, canLoadLayer, showAlerts])
}
