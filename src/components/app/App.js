import { useCachedDataQuery } from '@dhis2/analytics'
import { useDataEngine } from '@dhis2/app-runtime'
import { useAlert } from '@dhis2/app-service-alerts'
import { useSetting } from '@dhis2/app-service-datastore'
import i18n from '@dhis2/d2-i18n'
import { CssVariables } from '@dhis2/ui'
import queryString from 'query-string'
import React, { useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { tSetAnalyticalObject } from '../../actions/analyticalObject.js'
import { setInterpretation } from '../../actions/interpretations.js'
import { tOpenMap, newMap } from '../../actions/map.js'
import {
    ALERT_CRITICAL,
    ALERT_MESSAGE_DYNAMIC,
    // ALERT_OPTIONS_DYNAMIC,
    // ALERT_SUCCESS_DELAY,
} from '../../constants/alerts.js'
import { CURRENT_AO_KEY } from '../../util/analyticalObject.js'
import history from '../../util/history.js'
import AppLayout from './AppLayout.js'
import './App.css'
import './styles/App.module.css'

const getUrlParameter = (location, name) => {
    const parsed = queryString.parse(location.search, { parseBooleans: true })
    return parsed[name]
}

const getMapId = (hashLocation) => {
    const pathParts = hashLocation.pathname.slice(1).split('/')
    if (pathParts[0]) {
        return pathParts[0]
    }

    // support /?id=ytkZY3ChM6J for backwards compatibility
    return getUrlParameter(hashLocation, 'id')
}

const App = () => {
    // const [previousLocation, setPreviousLocation] = useState()
    const { systemSettings, basemaps } = useCachedDataQuery()
    const defaultBasemap = systemSettings.keyDefaultBaseMap
    const engine = useDataEngine()
    const [currentAO] = useSetting(CURRENT_AO_KEY)
    const dispatch = useDispatch()
    const openMapErrorAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_CRITICAL)

    const setInterpretationId = useCallback(
        (location) => {
            // support both lower and camel case for backwards compatibility
            const interpretationId =
                getUrlParameter(location, 'interpretationid') ||
                getUrlParameter(location, 'interpretationId')

            console.log('jj interpretationId', interpretationId)
            if (interpretationId) {
                dispatch(setInterpretation(interpretationId))
            }
        },
        [dispatch]
    )

    const loadMap = useCallback(
        async (location, isNew) => {
            console.log('jj location', location)
            const isExisting = location.pathname.length > 1

            if (isExisting) {
                const mapId = getMapId(location)
                if (mapId) {
                    const error = await dispatch(
                        tOpenMap({
                            mapId,
                            defaultBasemap,
                            engine,
                            basemaps,
                        })
                    )

                    if (error) {
                        openMapErrorAlert.show({
                            msg: i18n.t(
                                `Error while opening map: ${error.message}`,
                                {
                                    nsSeparator: ';',
                                }
                            ),
                        })

                        return
                    }
                } else if (
                    getUrlParameter(location, 'currentAnalyticalObject') ===
                    'true'
                ) {
                    await dispatch(tSetAnalyticalObject(currentAO))
                }
            } else if (isNew) {
                dispatch(newMap())
            }

            setInterpretationId(location)
            // setPreviousLocation(location.pathname)
        },
        [
            basemaps,
            currentAO,
            defaultBasemap,
            dispatch,
            engine,
            openMapErrorAlert,
            setInterpretationId,
        ]
    )

    useEffect(() => {
        console.log('jj App useEffect')
        loadMap(history.location)

        const unlisten = history.listen((myhistory) => {
            console.log('jj myhistory', myhistory)
            const { location } = myhistory
            // const isSaving = location.state?.isSaving
            // const isOpening = location.state?.isOpening
            // const isResetting = location.state?.isResetting
            const isModalOpening = location.state?.isModalOpening
            const isModalClosing = location.state?.isModalClosing
            // const isValidLocationChange =
            // previousLocation !== location.pathname &&
            // !isModalOpening && !isModalClosing

            // TODO navigation confirm dialog

            if (isModalOpening) {
                setInterpretationId(location)
            } else if (isModalClosing) {
                dispatch(setInterpretation())
                // } else if (isSaving || isOpening || isResetting) {
            } else {
                console.log('jj reload')
                loadMap(location, location.pathname === '/')
            }
        })

        return () => unlisten && unlisten()
    }, [loadMap, dispatch, setInterpretationId])

    return (
        <>
            <CssVariables colors spacers theme />
            <AppLayout />
        </>
    )
}

export default App
