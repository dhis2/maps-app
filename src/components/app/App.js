import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'
import 'typeface-roboto'
import { useDataEngine } from '@dhis2/app-runtime'
import { AlertsProvider } from '@dhis2/app-service-alerts'
import { useSetting } from '@dhis2/app-service-datastore'
import { CssReset, CssVariables } from '@dhis2/ui'
import isEmpty from 'lodash/isEmpty'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { tSetAnalyticalObject } from '../../actions/analyticalObject.js'
import { removeBingBasemaps, setBingMapsApiKey } from '../../actions/basemap.js'
import { tSetExternalLayers } from '../../actions/externalLayers.js'
import { tOpenMap } from '../../actions/map.js'
import { tSetOrgUnitTree } from '../../actions/orgUnits.js'
import { CURRENT_AO_KEY } from '../../util/analyticalObject.js'
import { getUrlParameter } from '../../util/requests.js'
import FatalErrorBoundary from '../errors/FatalErrorBoundary.js'
import { useSystemSettings } from '../SystemSettingsProvider.js'
import AppLayout from './AppLayout.js'
import styles from './styles/App.module.css'

const App = () => {
    const systemSettings = useSystemSettings()
    const engine = useDataEngine()
    const [currentAO] = useSetting(CURRENT_AO_KEY)
    const dispatch = useDispatch()

    useEffect(() => {
        async function fetchData() {
            await dispatch(tSetOrgUnitTree())
            await dispatch(tSetExternalLayers(engine))

            const mapId = getUrlParameter('id')
            if (mapId) {
                await dispatch(
                    tOpenMap(mapId, systemSettings.keyDefaultBaseMap, engine)
                )
            } else if (getUrlParameter('currentAnalyticalObject') === 'true') {
                await dispatch(tSetAnalyticalObject(currentAO))
            }
        }
        fetchData()
    }, [engine, currentAO, systemSettings.keyDefaultBaseMap, dispatch])

    useEffect(() => {
        if (!isEmpty(systemSettings)) {
            if (!systemSettings.keyBingMapsApiKey) {
                dispatch(removeBingBasemaps())
            } else {
                dispatch(setBingMapsApiKey(systemSettings.keyBingMapsApiKey))
            }
        }
    }, [systemSettings, dispatch])

    return (
        <FatalErrorBoundary>
            <AlertsProvider>
                <div className={styles.app}>
                    <CssReset />
                    <CssVariables colors spacers theme />
                    <AppLayout />
                </div>
            </AlertsProvider>
        </FatalErrorBoundary>
    )
}

export default App
