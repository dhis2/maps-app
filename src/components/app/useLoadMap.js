import { useCachedDataQuery } from '@dhis2/analytics'
import { useDataEngine } from '@dhis2/app-runtime'
import { useSetting } from '@dhis2/app-service-datastore'
import i18n from '@dhis2/d2-i18n'
import log from 'loglevel'
import { useRef, useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { setAnalyticalObject } from '../../actions/analyticalObject.js'
import { setDownloadMode } from '../../actions/download.js'
import { setInterpretation } from '../../actions/interpretations.js'
import { addLayer } from '../../actions/layers.js'
import { newMap, setMap } from '../../actions/map.js'
import { getFallbackBasemap } from '../../constants/basemaps.js'
import useAlert from '../../hooks/useAlert.js'
import {
    CURRENT_AO_KEY,
    hasSingleDataDimension,
    getThematicLayerFromAnalyticalObject,
} from '../../util/analyticalObject.js'
import { dataStatisticsMutation } from '../../util/apiDataStatistics.js'
import { addOrgUnitPaths } from '../../util/helpers.js'
import history, { getHashUrlParams } from '../../util/history.js'
import { fetchMap } from '../../util/requests.js'

export const useLoadMap = () => {
    const previousParamsRef = useRef({
        mapId: '',
        isDownload: false,
        interpretationId: null,
        isCurrentAO: false,
    })
    const { systemSettings, basemaps } = useCachedDataQuery()
    const defaultBasemap = systemSettings.keyDefaultBaseMap
    const engine = useDataEngine()
    const [currentAO] = useSetting(CURRENT_AO_KEY)
    const dispatch = useDispatch()
    const loadMapAlert = useAlert({ message: i18n.t('Failed to open the map') })
    const unrecognizedMapAlert = useAlert({
        message: i18n.t('Unrecognized url path to map'),
    })

    const loadMap = useCallback(
        async (hashLocation) => {
            previousParamsRef.current = getHashUrlParams(hashLocation)

            if (hashLocation.pathname === '/') {
                dispatch(newMap())
                return
            }

            const { mapId, isDownload, interpretationId } =
                previousParamsRef.current

            if (!mapId) {
                unrecognizedMapAlert.show()
                return
            }

            if (mapId === 'currentAnalyticalObject') {
                try {
                    hasSingleDataDimension(currentAO)
                        ? getThematicLayerFromAnalyticalObject(currentAO).then(
                              (layer) => dispatch(addLayer(layer))
                          )
                        : dispatch(setAnalyticalObject(currentAO))

                    if (isDownload) {
                        dispatch(setDownloadMode(true))
                    }
                } catch (e) {
                    log.error('Could not load current analytical object')
                    loadMapAlert.show()
                }
            } else {
                try {
                    const map = await fetchMap(mapId, engine, defaultBasemap)

                    engine.mutate(dataStatisticsMutation, {
                        variables: { id: mapId },
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

                    if (interpretationId) {
                        dispatch(setInterpretation(interpretationId))
                    } else if (isDownload) {
                        dispatch(setDownloadMode(true))
                    }
                } catch (e) {
                    log.error(e)
                    loadMapAlert.show()
                }
            }
        },
        [
            basemaps,
            currentAO,
            defaultBasemap,
            dispatch,
            engine,
            loadMapAlert,
            unrecognizedMapAlert,
        ]
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

            const { mapId, interpretationId, isDownload } =
                getHashUrlParams(location)

            if (action === 'REPLACE' || prevMapId !== mapId) {
                loadMap(location)
                return
            }

            if (isDownload !== prevIsDownload) {
                dispatch(setDownloadMode(isDownload))
                previousParamsRef.current.isDownload = isDownload
            } else if (interpretationId !== prevInterpretationId) {
                dispatch(setInterpretation(interpretationId))
                previousParamsRef.current.interpretationId = interpretationId
            }
        })

        return () => unlisten && unlisten()
    }, [loadMap, dispatch])
}
