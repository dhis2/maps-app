import { useCachedDataQuery } from '@dhis2/analytics'
import { useDataEngine } from '@dhis2/app-runtime'
import { useAlert } from '@dhis2/app-service-alerts'
import log from 'loglevel'
import { useRef, useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { setAnalyticalObject } from '../../actions/analyticalObject.js'
import { setInterpretation } from '../../actions/interpretations.js'
import { newMap, setMap } from '../../actions/map.js'
import { openDownloadMode, closeDownloadMode } from '../../actions/ui.js'
import {
    ALERT_CRITICAL,
    ALERT_MESSAGE_DYNAMIC,
} from '../../constants/alerts.js'
import { CURRENT_AO_KEY } from '../../util/analyticalObject.js'
import { dataStatisticsMutation } from '../../util/apiDataStatistics.js'
import { getBasemapOrFallback } from '../../util/basemaps.js'
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
    const basemapInvalidAlertRef = useRef(
        useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_CRITICAL)
    )
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
                    const map = await fetchMap({
                        id: params.mapId,
                        engine,
                        defaultBasemap,
                    })

                    engine.mutate(dataStatisticsMutation, {
                        variables: { id: params.mapId },
                        onError: (error) => log.error('Error: ', error),
                    })

                    const basemapConfig = getBasemapOrFallback({
                        basemaps,
                        id: map.basemap.id,
                        defaultId: defaultBasemap,
                        onMissing: (msg) =>
                            basemapInvalidAlertRef.current.show({ msg }),
                    })

                    const mapForStore = {
                        ...map,
                        mapViews: addOrgUnitPaths(map.mapViews),
                        basemap: { ...map.basemap, ...basemapConfig },
                    }

                    dispatch(setMap(mapForStore))
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
