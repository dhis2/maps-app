import { useDataEngine } from '@dhis2/app-runtime'
import { useDispatch } from 'react-redux'
import { initLayerTypes } from '../../actions/layerTypes.js'
import {
    MAPS_APP_NAMESPACE,
    LAYER_TYPES_VISIBILITY_KEY,
} from '../../constants/settings.js'

export const useCheckDataStoreIntegrity = () => {
    const resourceLayerTypesVisibility = `dataStore/${MAPS_APP_NAMESPACE}/${LAYER_TYPES_VISIBILITY_KEY}`
    const dispatch = useDispatch()
    const engine = useDataEngine()
    engine
        .query({ dataStore: { resource: 'dataStore' } })
        .then(({ dataStore }) => {
            if (!dataStore.includes(MAPS_APP_NAMESPACE)) {
                // Create namespace/key if missing in datastore
                engine
                    .mutate({
                        resource: resourceLayerTypesVisibility,
                        type: 'create',
                        data: [],
                    })
                    .then(() => {
                        dispatch(initLayerTypes([]))
                    })
            } else {
                engine
                    .query({
                        layerTypesVisibility: {
                            resource: resourceLayerTypesVisibility,
                        },
                    })
                    .then(({ layerTypesVisibility }) => {
                        if (!Array.isArray(layerTypesVisibility)) {
                            // Reset namespace/key if integrity has been broken
                            engine
                                .mutate({
                                    resource: resourceLayerTypesVisibility,
                                    type: 'update',
                                    data: [],
                                })
                                .then(() => {
                                    dispatch(initLayerTypes([]))
                                })
                        } else {
                            dispatch(initLayerTypes(layerTypesVisibility))
                        }
                    })
            }
        })
}
