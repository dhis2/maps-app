import { useCachedDataQuery } from '@dhis2/analytics'
import { useDataEngine } from '@dhis2/app-runtime'
import log from 'loglevel'
import { useRef, useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { setAnalyticalObject } from '../../actions/analyticalObject.js'
import { setInterpretation } from '../../actions/interpretations.js'
import { newMap, setMap } from '../../actions/map.js'
import { setOriginalMap } from '../../actions/originalMap.js'
import { openDownloadMode, closeDownloadMode } from '../../actions/ui.js'
import { getFallbackBasemap } from '../../constants/basemaps.js'
import { CURRENT_AO_KEY } from '../../util/analyticalObject.js'
import { dataStatisticsMutation } from '../../util/apiDataStatistics.js'
import { addOrgUnitPaths } from '../../util/helpers.js'
import history, {
    getHashUrlParams,
    defaultHashUrlParams,
} from '../../util/history.js'
import { fetchMap } from '../../util/requests.js'

// Used to avoid repeating `history` listener calls -- see below
let lastLocation

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
            } else if (params.mapId === CURRENT_AO_KEY) {
                dispatch(newMap())
                dispatch(setAnalyticalObject(true))
            } else {
                try {
                    console.log('jj fetchMap', {
                        defaultBasemap,
                        systemSettings,
                    })
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

                    const mapForStore = {
                        ...map,
                        mapViews: addOrgUnitPaths(map.mapViews),
                        basemap: { ...map.basemap, ...basemapConfig },
                    }

                    dispatch(setMap(mapForStore))

                    dispatch(setOriginalMap(mapForStore))
                } catch (e) {
                    log.error(e)
                    dispatch(newMap())
                }
            }
            if (params.isDownload) {
                dispatch(openDownloadMode())
            } else {
                dispatch(closeDownloadMode())
            }
            dispatch(setInterpretation(params.interpretationId))

            previousParamsRef.current = params
        },
        [basemaps, defaultBasemap, dispatch, engine]
    )

    useEffect(() => {
        loadMap(history.location)
    }, [loadMap])

    useEffect(() => {
        const unlisten = history.listen(({ action, location }) => {
            // Avoid duplicate actions for the same update object. This also
            // avoids a loop, because dispatching a pop state effect below also
            // triggers listeners again (but with the same location object key)
            const { key, pathname, search } = location
            if (
                key === lastLocation?.key &&
                pathname === lastLocation?.pathname &&
                search === lastLocation?.search
            ) {
                return
            }
            lastLocation = location
            // Dispatch this event for external routing listeners to observe,
            // e.g. global shell
            const popStateEvent = new PopStateEvent('popstate', {
                state: location.state,
            })
            dispatchEvent(popStateEvent)

            const params = getHashUrlParams(location)

            if (
                action === 'REPLACE' ||
                previousParamsRef.current.mapId !== params.mapId
            ) {
                loadMap(location)
                return
            }

            if (params.isDownload !== previousParamsRef.current.isDownload) {
                if (params.isDownload) {
                    dispatch(openDownloadMode())
                } else {
                    dispatch(closeDownloadMode())
                }
            }
            dispatch(setInterpretation(params.interpretationId))

            previousParamsRef.current = params
        })

        return () => unlisten && unlisten()
    }, [loadMap, dispatch])
}
