import { useCachedDataQuery } from '@dhis2/analytics'
import { useDataEngine } from '@dhis2/app-runtime'
import { useSetting } from '@dhis2/app-service-datastore'
import { CssVariables } from '@dhis2/ui'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { tSetAnalyticalObject } from '../../actions/analyticalObject.js'
import { tOpenMap } from '../../actions/map.js'
import { CURRENT_AO_KEY } from '../../util/analyticalObject.js'
import { getUrlParameter } from '../../util/requests.js'
import AppLayout from './AppLayout.js'
import './App.css'
import './styles/App.module.css'

const App = () => {
    const { systemSettings, basemaps } = useCachedDataQuery()
    const defaultBasemap = systemSettings.keyDefaultBaseMap
    const engine = useDataEngine()
    const [currentAO] = useSetting(CURRENT_AO_KEY)
    const dispatch = useDispatch()

    console.log('basemaps', basemaps)

    useEffect(() => {
        async function fetchData() {
            const mapId = getUrlParameter('id')
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
