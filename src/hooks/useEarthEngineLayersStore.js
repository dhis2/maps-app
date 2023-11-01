import React, { useState, useCallback, useEffect } from 'react'
import { useDataEngine } from '@dhis2/app-runtime'

export const MAPS_APP_NAMESPACE = 'MAPS_APP'
export const EARTH_ENGINE_LAYERS_KEY = 'EARTH_ENGINE_LAYERS'

// TODO: What if two users are toggling EE layers at the same time?

// https://docs.dhis2.org/en/develop/using-the-api/dhis-core-version-240/data-store.html
// https://dhis2-app-course.ifi.uio.no/learn/dhis2/app-development-guides/datastore/getting-data/
export const useEarthEngineLayersStore = () => {
    const [loading, setLoading] = useState(true)
    const [storedLayers, setStoredLayers] = useState([])
    const engine = useDataEngine()

    const resource = `dataStore/${MAPS_APP_NAMESPACE}`

    const createNamespaceKey = useCallback(() => {
        engine
            .mutate({
                resource: `${resource}/${EARTH_ENGINE_LAYERS_KEY}`,
                type: 'create',
                params: {
                    // encrypt: true, // TODO: Enable?
                },
                data: [],
            })
            .then((response) => {
                if (response.httpStatusCode === 201) {
                    getLayers()
                } else {
                    console.log('error', response)
                }
            })
            .catch((error) => {
                console.log('error', error)
            })
    }, [engine, resource])

    const getLayers = useCallback(() => {
        setLoading(true)
        engine
            .query({
                dataStore: {
                    resource: 'dataStore',
                },
            })
            .then(({ dataStore }) => {
                if (dataStore.includes(MAPS_APP_NAMESPACE)) {
                    engine
                        .query({
                            layers: {
                                resource: `${resource}/${EARTH_ENGINE_LAYERS_KEY}`,
                            },
                        })
                        .then(({ layers }) => {
                            // console.log('layers', layers)
                            setStoredLayers(layers)
                            setLoading(false)
                        })
                } else {
                    createNamespaceKey()
                    // setStoredLayers([])
                    // setLoading(false)
                }
            })
    }, [engine, resource, createNamespaceKey])

    const addLayer = useCallback(
        (layerId) => {
            // console.log('addLayer', layerId, storedLayers)

            if (!storedLayers.includes(layerId)) {
                const newLayers = [...storedLayers, layerId]
                // setStoredLayers(newLayers)

                engine
                    .mutate({
                        resource: `${resource}/${EARTH_ENGINE_LAYERS_KEY}`,
                        type: 'update',
                        params: {
                            // encrypt: true, // TODO: Enable?
                        },
                        data: newLayers,
                    })
                    .then((response) => {
                        if (response.httpStatusCode === 200) {
                            getLayers()
                        } else {
                            console.log('error', response)
                        }
                    })
                    .catch((error) => {
                        console.log('error', error)
                    })
            } else {
                console.log('Layer already added')
            }
        },
        [engine, storedLayers, getLayers]
    )

    const removeLayer = useCallback(
        (layerId) => {
            // console.log('Remove layer', layerId)

            if (storedLayers.includes(layerId)) {
                const newLayers = storedLayers.filter((l) => l !== layerId)
                // setStoredLayers(newLayers)

                engine
                    .mutate({
                        resource: `${resource}/${EARTH_ENGINE_LAYERS_KEY}`,
                        type: 'update',
                        params: {
                            // encrypt: true, // TODO: Enable?
                        },
                        data: newLayers,
                    })
                    .then((response) => {
                        if (response.httpStatusCode === 200) {
                            getLayers()
                        } else {
                            console.log('error', response)
                        }
                    })
                    .catch((error) => {
                        console.log('error', error)
                    })
            } else {
                console.log('Layer already removed')
            }
        },
        [engine, storedLayers, getLayers]
    )

    useEffect(() => {
        getLayers()
    }, [engine])

    return { storedLayers, loading, addLayer, removeLayer }
}

export default useEarthEngineLayersStore
