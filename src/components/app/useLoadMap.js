import { useCachedDataQuery } from '@dhis2/analytics'
import { useDataEngine } from '@dhis2/app-runtime'
import log from 'loglevel'
import { useRef, useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { setAnalyticalObject } from '../../actions/analyticalObject.js'
import { setDownloadMode } from '../../actions/download.js'
import { setInterpretation } from '../../actions/interpretations.js'
import { newMap, setMap } from '../../actions/map.js'
import { getFallbackBasemap } from '../../constants/basemaps.js'
import { CURRENT_AO_KEY } from '../../util/analyticalObject.js'
import { dataStatisticsMutation } from '../../util/apiDataStatistics.js'
import { addOrgUnitPaths } from '../../util/helpers.js'
import history, {
    getHashUrlParams,
    defaultHashUrlParams,
} from '../../util/history.js'
import { fetchMap } from '../../util/requests.js'

export const useLoadMap = () => {
    const previousParamsRef = useRef(defaultHashUrlParams)
    const { systemSettings, basemaps } = useCachedDataQuery()
    const defaultBasemap = systemSettings.keyDefaultBaseMap
    const engine = useDataEngine()
    const dispatch = useDispatch()

    const loadMap = useCallback(
        async (hashLocation) => {
            const params = getHashUrlParams(hashLocation)

            if (params.mapId === '') {
                dispatch(newMap())
                if (
                    params.isDownload !== previousParamsRef.current.isDownload
                ) {
                    dispatch(setDownloadMode(params.isDownload))
                }
            } else if (params.mapId === CURRENT_AO_KEY) {
                dispatch(newMap())
                dispatch(setAnalyticalObject(true))
                if (params.isDownload) {
                    dispatch(setDownloadMode(true))
                }
            } else {
                try {
                    const map = await fetchMap(
                        params.mapId,
                        engine,
                        defaultBasemap
                    )

                    engine.mutate(dataStatisticsMutation, {
                        variables: { id: params.mapId },
                        onError: (error) => log.error('Error: ', error),
                    })

                    const basemapConfig =
                        basemaps.find(({ id }) => id === map.basemap.id) ||
                        basemaps.find(({ id }) => id === defaultBasemap) ||
                        getFallbackBasemap()

                    dispatch(
                        setMap({
                            ...map,
                            mapViews: addOrgUnitPaths(map.mapViews),
                            basemap: { ...map.basemap, ...basemapConfig },
                        })
                    )

                    if (params.interpretationId) {
                        dispatch(setInterpretation(params.interpretationId))
                    } else if (params.isDownload) {
                        dispatch(setDownloadMode(true))
                    }
                } catch (e) {
                    log.error(e)
                    dispatch(newMap())
                    dispatch(setDownloadMode(false))
                }
            }

            previousParamsRef.current = params
        },
        [basemaps, defaultBasemap, dispatch, engine]
    )

    useEffect(() => {
        loadMap(history.location)
    }, [loadMap])

    useEffect(() => {
        const unlisten = history.listen(({ action, location }) => {
            const {
                mapId: prevMapId,
                interpretationId: prevInterpretationId,
                isDownload: prevIsDownload,
            } = previousParamsRef.current

            const params = getHashUrlParams(location)

            if (action === 'REPLACE' || prevMapId !== params.mapId) {
                loadMap(location)
                return
            }

            if (params.isDownload !== prevIsDownload) {
                dispatch(setDownloadMode(params.isDownload))
            } else if (params.interpretationId !== prevInterpretationId) {
                dispatch(setInterpretation(params.interpretationId))
            }

            previousParamsRef.current = params
        })

        return () => unlisten && unlisten()
    }, [loadMap, dispatch])
}
