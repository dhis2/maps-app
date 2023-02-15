import { useDataEngine } from '@dhis2/app-runtime'
import { useSetting } from '@dhis2/app-service-datastore'
import { CssVariables } from '@dhis2/ui'
import isEmpty from 'lodash/isEmpty'
import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { tSetAnalyticalObject } from '../../actions/analyticalObject.js'
import { removeBingBasemaps, setBingMapsApiKey } from '../../actions/basemap.js'
import { tSetExternalLayers } from '../../actions/externalLayers.js'
import { tOpenMap } from '../../actions/map.js'
import { tSetOrgUnitTree } from '../../actions/orgUnits.js'
import { CURRENT_AO_KEY } from '../../util/analyticalObject.js'
import { getUrlParameter } from '../../util/requests.js'
import AlertStack from '../alerts/AlertStack.js'
import BottomPanel from '../datatable/BottomPanel.js'
import LayerEdit from '../edit/LayerEdit.js'
import InterpretationsPanel from '../interpretations/InterpretationsPanel.js'
import DataDownloadDialog from '../layers/download/DataDownloadDialog.js'
import LayersPanel from '../layers/LayersPanel.js'
import LayersToggle from '../layers/LayersToggle.js'
import LayersLoader from '../loaders/LayersLoader.js'
import ContextMenu from '../map/ContextMenu.js'
import MapContainer from '../map/MapContainer.js'
import OpenAsMapDialog from '../openAs/OpenAsMapDialog.js'
import OrgUnitProfile from '../orgunits/OrgUnitProfile.js'
import { useSystemSettings } from '../SystemSettingsProvider.js'
import AppMenu from './AppMenu.js'
import styles from './styles/App.module.css'

const App = () => {
    const [basemapsLoaded, setBasemapsLoaded] = useState(false)
    const systemSettings = useSystemSettings()
    const engine = useDataEngine()
    const [currentAO] = useSetting(CURRENT_AO_KEY)
    const dispatch = useDispatch()

    useEffect(() => {
        async function fetchData() {
            await dispatch(tSetOrgUnitTree())
            await dispatch(tSetExternalLayers(engine))
            setBasemapsLoaded(true)

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
        <div className={styles.app}>
            <AppMenu />
            <InterpretationsPanel />
            {basemapsLoaded && (
                <>
                    <LayersToggle />
                    <LayersPanel />
                    <LayersLoader />
                    <MapContainer />
                </>
            )}
            <BottomPanel />
            <LayerEdit />
            <ContextMenu />
            <AlertStack />
            <DataDownloadDialog />
            <OpenAsMapDialog />
            <OrgUnitProfile />
            <CssVariables colors spacers theme />
        </div>
    )
}

export default App
