import { useDataEngine } from '@dhis2/app-runtime'
import { useSetting } from '@dhis2/app-service-datastore'
import { CssVariables } from '@dhis2/ui'
import isEmpty from 'lodash/isEmpty'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { tSetAnalyticalObject } from '../../actions/analyticalObject.js'
import { removeBingBasemaps, setBingMapsApiKey } from '../../actions/basemap.js'
import { tSetEarthEngineLayers } from '../../actions/earthEngineLayers.js'
import { tSetExternalLayers } from '../../actions/externalLayers.js'
import { setInterpretation } from '../../actions/interpretations.js'
import { tOpenMap } from '../../actions/map.js'
import { CURRENT_AO_KEY } from '../../util/analyticalObject.js'
import { getUrlParameter } from '../../util/requests.js'
import { useSystemSettings } from '../SystemSettingsProvider.js'
import AppLayout from './AppLayout.js'
import './App.css'
import './styles/App.module.css'

const App = () => {
    const systemSettings = useSystemSettings()
    const engine = useDataEngine()
    const [currentAO] = useSetting(CURRENT_AO_KEY)
    const dispatch = useDispatch()

    useEffect(() => {
        async function fetchData() {
            await dispatch(tSetEarthEngineLayers(engine))
            await dispatch(tSetExternalLayers(engine))

            const mapId = getUrlParameter('id')
            if (mapId) {
                await dispatch(
                    tOpenMap(mapId, systemSettings.keyDefaultBaseMap, engine)
                )
            } else if (getUrlParameter('currentAnalyticalObject') === 'true') {
                await dispatch(tSetAnalyticalObject(currentAO))
            }

            // analytics interpretation component uses camelcase
            const interpretationId =
                getUrlParameter('interpretationid') ||
                getUrlParameter('interpretationId')

            if (interpretationId) {
                dispatch(setInterpretation(interpretationId))
            }
        }

        if (!isEmpty(systemSettings)) {
            fetchData()
        }
    }, [engine, currentAO, systemSettings, dispatch])

    useEffect(() => {
        if (!isEmpty(systemSettings)) {
            if (!systemSettings.keyBingMapsApiKey) {
                dispatch(removeBingBasemaps())
            } else {
                dispatch(setBingMapsApiKey(systemSettings.keyBingMapsApiKey))
            }
        }
    }, [systemSettings, dispatch])

    return !isEmpty(systemSettings) ? (
        <>
            <CssVariables colors spacers theme />
            <AppLayout />
        </>
    ) : null
}

export default App
