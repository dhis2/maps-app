import { useCachedDataQuery } from '@dhis2/analytics'
import { useDataEngine } from '@dhis2/app-runtime'
import { useSetting } from '@dhis2/app-service-datastore'
import i18n from '@dhis2/d2-i18n'
import log from 'loglevel'
import queryString from 'query-string'
import { useState, useEffect, useCallback } from 'react'
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
import history from '../../util/history.js'
import { fetchMap } from '../../util/requests.js'

const getUrlParams = (hashLocation) => {
    const hashQueryParams = queryString.parse(hashLocation.search, {
        parseBooleans: true,
    })

    const params = {}
    const pathParts = hashLocation.pathname.slice(1).split('/')
    if (pathParts[0]) {
        if (pathParts[0]?.length === 11) {
            params.mapId = pathParts[0]
        } else if (pathParts[0] === 'currentAnalyticalObject') {
            params.isCurrentAO = true
        } else {
            // TODO throw error - unrecognized path
        }
        if (pathParts[1] === 'download') {
            params.isDownload = true

            if (hashQueryParams.isPushAnalytics) {
                params.isPushAnalytics = true
            }
        }

        if (params.mapId) {
            params.interpretationId = hashQueryParams.interpretationId

            params.initialFocus = hashQueryParams.initialFocus
        }
    }

    return params
}

export const useLoadMap = () => {
    const [previousLocation, setPreviousLocation] = useState()
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
            console.log('jj loadMap')

            if (hashLocation.pathname === '/') {
                dispatch(newMap())
                return
            }

            const {
                mapId,
                isCurrentAO,
                isDownload,
                isPushAnalytics,
                interpretationId,
                initialFocus,
            } = getUrlParams(hashLocation)

            if (mapId) {
                try {
                    // throw new Error('test')
                    const map = await fetchMap(mapId, engine, defaultBasemap)

                    engine.mutate(dataStatisticsMutation, {
                        variables: { id: mapId },
                        onError: (error) => log.error('Error: ', error),
                    })

                    const basemapConfig =
                        basemaps.find((bm) => bm.id === map.basemap.id) ||
                        getFallbackBasemap()

                    dispatch(
                        setMap({
                            ...map,
                            mapViews: addOrgUnitPaths(map.mapViews),
                            basemap: { ...map.basemap, ...basemapConfig },
                        })
                    )
                } catch (e) {
                    log.error(e)
                    loadMapAlert.show()
                    return
                }

                if (interpretationId) {
                    dispatch(
                        setInterpretation({
                            id: interpretationId,
                            initialFocus,
                        })
                    )
                } else if (isDownload) {
                    dispatch(
                        setDownloadMode({ downloadMode: true, isPushAnalytics })
                    )
                }
            } else if (isCurrentAO) {
                try {
                    hasSingleDataDimension(currentAO)
                        ? getThematicLayerFromAnalyticalObject(currentAO).then(
                              (layer) => dispatch(addLayer(layer))
                          )
                        : dispatch(setAnalyticalObject(currentAO))

                    if (isDownload) {
                        dispatch(
                            setDownloadMode({
                                downloadMode: true,
                                isPushAnalytics: false,
                            })
                        )
                    }
                } catch (e) {
                    log.error('Could not load current analytical object')
                    loadMapAlert.show()
                    return
                }
            } else {
                unrecognizedMapAlert.show()
                return
            }

            setPreviousLocation(hashLocation.pathname)
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
        const unlisten = history.listen(({ location }) => {
            const params = getUrlParams(location)
            const isSaving = location.state?.isSaving
            const isOpening = location.state?.isOpening
            const isResetting = location.state?.isResetting
            const isModalOpening = location.state?.isModalOpening
            const isModalClosing = location.state?.isModalClosing
            const isDownloadOpening = location.state?.isDownloadOpening
            const isDownloadClosing = location.state?.isDownloadClosing
            const isValidLocationChange =
                previousLocation !== location.pathname &&
                !isModalOpening &&
                !isModalClosing &&
                !isDownloadOpening &&
                !isDownloadClosing

            // TODO navigation confirm dialog

            if (isDownloadOpening) {
                dispatch(
                    setDownloadMode({
                        downloadMode: true,
                        isPushAnalytics: false,
                    })
                )
            } else if (isDownloadClosing) {
                dispatch(
                    setDownloadMode({
                        downloadMode: false,
                        isPushAnalytics: false,
                    })
                )
            } else if (isModalOpening && params.interpretationId) {
                dispatch(
                    setInterpretation({
                        id: params.interpretationId,
                        initialFocus: params.initialFocus,
                    })
                )
            } else if (isModalClosing && !params.interpretationId) {
                dispatch(setInterpretation({}))
            }

            if (isSaving || isOpening || isResetting || isValidLocationChange) {
                loadMap(location)
            }
        })

        return () => unlisten && unlisten()
    }, [loadMap, previousLocation, dispatch])
}
