import { useDataEngine } from '@dhis2/app-runtime'
import { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addLayerSource, removeLayerSource } from '../actions/layerSources.js'
import {
    MAPS_APP_NAMESPACE,
    MAPS_APP_KEY_MANAGED_LAYER_SOURCES,
} from '../constants/settings.js'

const resourceLayerSourcesVisibility = `dataStore/${MAPS_APP_NAMESPACE}/${MAPS_APP_KEY_MANAGED_LAYER_SOURCES}`

const useManagedLayerSourcesStore = () => {
    const [error, setError] = useState()
    const engine = useDataEngine()
    const dispatch = useDispatch()
    const managedLayerSources = useSelector((state) => state.layerSources)

    // Add layer id to data store & redux store
    const showLayerSource = useCallback(
        (layerId) => {
            if (!managedLayerSources.includes(layerId)) {
                engine
                    .mutate({
                        resource: resourceLayerSourcesVisibility,
                        type: 'update',
                        data: [...managedLayerSources, layerId],
                    })
                    .then((response) => {
                        if ([200, 201].includes(response.httpStatusCode)) {
                            dispatch(addLayerSource(layerId))
                        } else {
                            setError(response)
                        }
                    })
                    .catch(setError)
            }
        },
        [engine, dispatch, managedLayerSources]
    )

    // Remove layer id from data store & redux store
    const hideLayerSource = useCallback(
        (layerId) => {
            if (managedLayerSources.includes(layerId)) {
                engine
                    .mutate({
                        resource: resourceLayerSourcesVisibility,
                        type: 'update',
                        data: managedLayerSources.filter((l) => l !== layerId),
                    })
                    .then((response) => {
                        if ([200, 201].includes(response.httpStatusCode)) {
                            dispatch(removeLayerSource(layerId))
                        } else {
                            setError(response)
                        }
                    })
                    .catch(setError)
            }
        },
        [engine, dispatch, managedLayerSources]
    )

    return { managedLayerSources, showLayerSource, hideLayerSource, error }
}

export default useManagedLayerSourcesStore
