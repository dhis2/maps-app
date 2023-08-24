import { useCachedDataQuery } from '@dhis2/analytics'
import { useDataEngine } from '@dhis2/app-runtime'
import { useSetting } from '@dhis2/app-service-datastore'
import { CssVariables } from '@dhis2/ui'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { tSetAnalyticalObject } from '../../actions/analyticalObject.js'
import { setInterpretation } from '../../actions/interpretations.js'
import { tOpenMap } from '../../actions/map.js'
import { CURRENT_AO_KEY } from '../../util/analyticalObject.js'
import history from '../../util/history.js'
import { getUrlParameter } from '../../util/requests.js'
import AppLayout from './AppLayout.js'
import './App.css'
import './styles/App.module.css'

const parseLocation = (hashLocation) => {
    const pathParts = hashLocation.pathname.slice(1).split('/')
    return { id: pathParts[0] }
}

const getMapId = (hashLocation) => {
    const parsedHash = parseLocation(hashLocation)
    if (parsedHash.id) {
        return parsedHash.id
    }

    // support /?id=ytkZY3ChM6J for backwards compatibility
    return getUrlParameter('id')
}

const App = () => {
    const { systemSettings, basemaps } = useCachedDataQuery()
    const defaultBasemap = systemSettings.keyDefaultBaseMap
    const engine = useDataEngine()
    const [currentAO] = useSetting(CURRENT_AO_KEY)
    const dispatch = useDispatch()

    useEffect(() => {
        async function fetchData() {
            const mapId = getMapId(history.location)
            if (mapId) {
                await dispatch(
                    tOpenMap({
                        mapId,
                        defaultBasemap,
                        engine,
                        basemaps,
                    })
                )
            } else if (getUrlParameter('currentAnalyticalObject') === 'true') {
                await dispatch(tSetAnalyticalObject(currentAO))
            }

            // support both lower and camel case for backwards compatibility
            const interpretationId =
                getUrlParameter('interpretationid') ||
                getUrlParameter('interpretationId')

            if (interpretationId) {
                dispatch(setInterpretation(interpretationId))
            }
        }

        fetchData()
    }, [engine, currentAO, defaultBasemap, basemaps, dispatch])

    return (
        <>
            <CssVariables colors spacers theme />
            <AppLayout />
        </>
    )
}

export default App
