import { useDataEngine } from '@dhis2/app-runtime'
import { useState, useCallback, useEffect } from 'react'

const MAPS_APP_NAMESPACE = 'MAPS_APP'
const EARTH_ENGINE_LAYERS_KEY = 'EARTH_ENGINE_LAYERS'

const resource = `dataStore/${MAPS_APP_NAMESPACE}/${EARTH_ENGINE_LAYERS_KEY}`

// TODO: authorization
const useEarthEngineLayersStore = () => {
    const [loading, setLoading] = useState(true)
    const [addedLayers, setAddedLayers] = useState([])
    const [error, setError] = useState()
    const engine = useDataEngine()

    // Fetch layers / create namspace/key if missing
    const getLayers = useCallback(() => {
        setLoading(true)
        engine
            .query({ dataStore: { resource: 'dataStore' } })
            .then(({ dataStore }) => {
                if (dataStore.includes(MAPS_APP_NAMESPACE)) {
                    // Fetch layers if namespace/keys exists in data store
                    engine
                        .query({ layers: { resource } })
                        .then(({ layers }) => {
                            setAddedLayers(layers)
                            setLoading(false)
                        })
                } else {
                    // Create namespace/keys if missing in data store
                    engine
                        .mutate({
                            resource,
                            type: 'create',
                            data: [],
                        })
                        .then((response) => {
                            if (response.httpStatusCode === 201) {
                                setLoading(false)
                            } else {
                                setError(response)
                            }
                        })
                        .catch(setError)
                }
            })
    }, [engine])

    // Add layer id to data store
    const addLayer = useCallback(
        (layerId) => {
            if (!addedLayers.includes(layerId)) {
                engine
                    .mutate({
                        resource,
                        type: 'update',
                        data: [...addedLayers, layerId],
                    })
                    .then((response) => {
                        if (response.httpStatusCode === 200) {
                            getLayers()
                        } else {
                            setError(response)
                        }
                    })
                    .catch(setError)
            }
        },
        [engine, addedLayers, getLayers]
    )

    // Remove layer id from data store
    const removeLayer = useCallback(
        (layerId) => {
            if (addedLayers.includes(layerId)) {
                engine
                    .mutate({
                        resource,
                        type: 'update',
                        data: addedLayers.filter((l) => l !== layerId),
                    })
                    .then((response) => {
                        if (response.httpStatusCode === 200) {
                            getLayers()
                        } else {
                            setError(response)
                        }
                    })
                    .catch(setError)
            }
        },
        [engine, addedLayers, getLayers]
    )

    useEffect(() => {
        getLayers()
    }, [engine, getLayers])

    return { addedLayers, loading, addLayer, removeLayer, error }
}

export default useEarthEngineLayersStore
