import { useDataEngine } from '@dhis2/app-runtime'
import { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { showLayerTypes, hideLayerTypes } from '../actions/layerTypes.js'
import {
    MAPS_APP_NAMESPACE,
    LAYER_TYPES_VISIBILITY_KEY,
} from '../constants/settings.js'

const resourceLayerTypesVisibility = `dataStore/${MAPS_APP_NAMESPACE}/${LAYER_TYPES_VISIBILITY_KEY}`

const useLayerTypesVisibilityStore = () => {
    const [error, setError] = useState()
    const engine = useDataEngine()
    const dispatch = useDispatch()
    const visibleLayerTypes = useSelector((state) => state.layerTypes)

    // Add layer id to data store & redux store
    const showLayerType = useCallback(
        (layerId) => {
            if (!visibleLayerTypes.includes(layerId)) {
                engine
                    .mutate({
                        resource: resourceLayerTypesVisibility,
                        type: 'update',
                        data: [...visibleLayerTypes, layerId],
                    })
                    .then((response) => {
                        if (response.httpStatusCode === 200) {
                            dispatch(showLayerTypes(layerId))
                        } else {
                            setError(response)
                        }
                    })
                    .catch(setError)
            }
        },
        [engine, dispatch, visibleLayerTypes]
    )

    // Remove layer id from data store & redux store
    const hideLayerType = useCallback(
        (layerId) => {
            if (visibleLayerTypes.includes(layerId)) {
                engine
                    .mutate({
                        resource: resourceLayerTypesVisibility,
                        type: 'update',
                        data: visibleLayerTypes.filter((l) => l !== layerId),
                    })
                    .then((response) => {
                        if (response.httpStatusCode === 200) {
                            dispatch(hideLayerTypes(layerId))
                        } else {
                            setError(response)
                        }
                    })
                    .catch(setError)
            }
        },
        [engine, dispatch, visibleLayerTypes]
    )

    return { visibleLayerTypes, showLayerType, hideLayerType, error }
}

export default useLayerTypesVisibilityStore
