import { useDataEngine } from '@dhis2/app-runtime'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    OPEN_CLIMATE_SERVICE_RESOURCE,
    fetchOpenClimateServiceSettings,
    fetchRasterCollections,
    getLayerSource,
    normalizeUrl,
} from '../util/openClimateService.js'

// The stored settings, shared by all components (undefined until loaded)
let storedSettings

// The Open Climate Service linked to this DHIS2 instance, and its published
// raster datasets as layer sources. All published datasets are available to
// add to maps, unless hidden by an administrator.
const useOpenClimateService = () => {
    const engine = useDataEngine()
    const [settings, setSettings] = useState(storedSettings)
    const [layerSources, setLayerSources] = useState([])
    const [error, setError] = useState()
    const url = settings?.url
    const hidden = useMemo(() => settings?.hidden || [], [settings])

    useEffect(() => {
        if (storedSettings === undefined) {
            fetchOpenClimateServiceSettings(engine).then((settings) => {
                storedSettings = settings
                setSettings(settings)
            })
        }
    }, [engine])

    useEffect(() => {
        if (!url) {
            setLayerSources([])
            return
        }
        let cancelled = false
        fetchRasterCollections(url)
            .then((collections) => {
                if (!cancelled) {
                    setLayerSources(collections.map(getLayerSource))
                    setError(null)
                }
            })
            .catch((error) => !cancelled && setError(error))
        return () => {
            cancelled = true
        }
    }, [url])

    const save = useCallback(
        async (newSettings) => {
            await engine.mutate({
                resource: OPEN_CLIMATE_SERVICE_RESOURCE,
                type: storedSettings ? 'update' : 'create',
                data: newSettings,
            })
            storedSettings = newSettings
            setSettings(newSettings)
        },
        [engine]
    )

    // Checks that the url is an OCS instance before it is stored
    const link = useCallback(
        async (newUrl) => {
            const url = normalizeUrl(newUrl)
            await fetchRasterCollections(url)
            await save({ url, hidden: [] })
        },
        [save]
    )

    const unlink = useCallback(async () => {
        await engine.mutate({
            resource: OPEN_CLIMATE_SERVICE_RESOURCE,
            type: 'delete',
        })
        storedSettings = null
        setSettings(null)
    }, [engine])

    const setVisibility = useCallback(
        (datasetId, isVisible) =>
            save({
                url,
                hidden: isVisible
                    ? hidden.filter((id) => id !== datasetId)
                    : [...hidden, datasetId],
            }),
        [save, url, hidden]
    )

    return {
        url,
        layerSources,
        hidden,
        error,
        link,
        unlink,
        setVisibility,
    }
}

export default useOpenClimateService
