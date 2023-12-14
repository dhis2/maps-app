import { useCachedDataQuery } from '@dhis2/analytics'
import { useDataEngine } from '@dhis2/app-runtime'
// import { useAlert } from '@dhis2/app-service-alerts'
import { useSetting } from '@dhis2/app-service-datastore'
// import i18n from '@dhis2/d2-i18n'
import log from 'loglevel'
import queryString from 'query-string'
import { useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { setAnalyticalObject } from '../../actions/analyticalObject.js'
import { setInterpretation } from '../../actions/interpretations.js'
import { addLayer } from '../../actions/layers.js'
import { newMap, setMap } from '../../actions/map.js'
// import {
//     ALERT_CRITICAL,
//     ALERT_MESSAGE_DYNAMIC,
// } from '../../constants/alerts.js'
import { getFallbackBasemap } from '../../constants/basemaps.js'
import {
    CURRENT_AO_KEY,
    // clearAnalyticalObjectFromUrl,
    hasSingleDataDimension,
    getThematicLayerFromAnalyticalObject,
} from '../../util/analyticalObject.js'
import { dataStatisticsMutation } from '../../util/apiDataStatistics.js'
import { addOrgUnitPaths } from '../../util/helpers.js'
import history from '../../util/history.js'
import { fetchMap } from '../../util/requests.js'
// import { get } from 'lodash'

const getUrlParameter = (location, name) => {
    const parsed = queryString.parse(location.search, { parseBooleans: true })
    return parsed[name]
}

// const getMapId = (hashLocation) => {
//     const pathParts = hashLocation.pathname.slice(1).split('/')
//     if (pathParts[0]) {
//         return pathParts[0]?.length === 11 ? pathParts[0] : null
//     }

//     // support /?id=ytkZY3ChM6J for backwards compatibility
//     return getUrlParameter(hashLocation, 'id')
// }

// const isCurrentAnalyticalObject = (hashLocation) => {
//     const currentAnalyticalObject = getUrlParameter(
//         hashLocation,
//         'currentAnalyticalObject'
//     )
//     if (currentAnalyticalObject) {
//         return currentAnalyticalObject === 'true'
//     }

//     const pathParts = hashLocation.pathname.slice(1).split('/')
//     if (pathParts[0] === 'currentAnalyticalObject') {
//         return true
//     }
//     return false
// }

export const useLoadMap = () => {
    console.log('jj useLoadMap')
    // const [previousLocation, setPreviousLocation] = useState()
    const { systemSettings, basemaps } = useCachedDataQuery()
    const defaultBasemap = systemSettings.keyDefaultBaseMap
    const engine = useDataEngine()
    const [currentAO] = useSetting(CURRENT_AO_KEY)
    const dispatch = useDispatch()
    // const openMapErrorAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_CRITICAL)
    // const openMapErrorAlert = useAlert('Unrecognized path')

    const getUrlParams = useCallback((hashLocation) => {
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
                // get interpretationId from hash query params
                params.interpretationId =
                    hashQueryParams.interpretationId ||
                    hashQueryParams.interpretationid
            }
        }

        return params
    }, [])

    const setInterpretationId = useCallback(
        (location) => {
            // support both lower and camel case for backwards compatibility
            const interpretationId =
                getUrlParameter(location, 'interpretationid') ||
                getUrlParameter(location, 'interpretationId')

            if (interpretationId) {
                dispatch(setInterpretation(interpretationId))
            }
        },
        [dispatch]
    )

    const loadMap = useCallback(
        async (hashLocation) => {
            const isNew =
                hashLocation.pathname === '/' &&
                !hashLocation.search.length &&
                location.search.length === 0

            if (isNew) {
                dispatch(newMap())
                return
            }

            const {
                mapId,
                isCurrentAO,
                // isDownload,
                // isPushAnalytics,
                interpretationId,
            } = getUrlParams(hashLocation)
            if (mapId) {
                try {
                    const map = await fetchMap(mapId, engine, defaultBasemap)

                    // record visualization view
                    engine.mutate(dataStatisticsMutation, {
                        variables: { id: mapId },
                        onError: (error) => log.error('Error: ', error),
                    })

                    const basemapConfig =
                        basemaps.find((bm) => bm.id === map.basemap.id) ||
                        getFallbackBasemap()

                    const basemap = { ...map.basemap, ...basemapConfig }

                    dispatch(
                        setMap({
                            ...map,
                            mapViews: addOrgUnitPaths(map.mapViews),
                            basemap,
                        })
                    )
                } catch (e) {
                    log.error(e)
                    // openMapErrorAlert.show({
                    //     msg: i18n.t(`Error while opening map: ${e.message}`, {
                    //         nsSeparator: ';',
                    //     }),
                    // })

                    return e
                }

                if (interpretationId) {
                    dispatch(setInterpretation(interpretationId))
                }
            } else if (isCurrentAO) {
                try {
                    return hasSingleDataDimension(currentAO)
                        ? getThematicLayerFromAnalyticalObject(currentAO).then(
                              (layer) => dispatch(addLayer(layer))
                          )
                        : dispatch(setAnalyticalObject(currentAO))
                } catch (e) {
                    log.error('Could not load current analytical object')
                    return e
                }
            }

            // setPreviousLocation(location.pathname)
        },
        [
            basemaps,
            currentAO,
            defaultBasemap,
            dispatch,
            engine,
            // openMapErrorAlert, // causes rerenders unnecessarily
            getUrlParams,
        ]
    )

    useEffect(() => {
        loadMap(history.location)

        const unlisten = history.listen((myhistory) => {
            console.log('jj myhistory', myhistory)
            const { location: hashLocation } = myhistory

            // const isSaving = hashLocation.state?.isSaving
            // const isOpening = hashLocation.state?.isOpening
            // const isResetting = hashLocation.state?.isResetting
            const isModalOpening = hashLocation.state?.isModalOpening
            const isModalClosing = hashLocation.state?.isModalClosing
            // const isValidLocationChange =
            // previousLocation !== location.pathname &&
            // !isModalOpening && !isModalClosing

            // TODO navigation confirm dialog

            if (isModalOpening) {
                setInterpretationId(hashLocation)
            } else if (isModalClosing) {
                dispatch(setInterpretation())
                // } else if (isSaving || isOpening || isResetting) {
            } else {
                console.log('jj reload')
                loadMap(hashLocation)
            }
        })

        return () => unlisten && unlisten()
    }, [dispatch, setInterpretationId, loadMap])

    return
}
