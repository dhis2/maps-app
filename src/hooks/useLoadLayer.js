import { Analytics, useDataOutputPeriodTypes } from '@dhis2/analytics'
import { useDataEngine, useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useCallback, useState } from 'react'
import { useCachedData } from '../components/cachedDataProvider/CachedDataProvider.jsx'
import { THEMATIC_LAYER, EVENT_LAYER } from '../constants/layers.js'
import earthEngineLoader from '../loaders/earthEngineLoader.js'
import eventLoader from '../loaders/eventLoader.js'
import externalLoader from '../loaders/externalLoader.js'
import facilityLoader from '../loaders/facilityLoader.js'
import geoJsonUrlLoader from '../loaders/geoJsonUrlLoader.js'
import orgUnitLoader from '../loaders/orgUnitLoader.js'
import thematicLoader from '../loaders/thematicLoader.js'
import trackedEntityLoader from '../loaders/trackedEntityLoader.js'
import { createLayerAlertFromError } from '../util/layerAlerts.js'

const LOADERS = {
    earthEngine: earthEngineLoader,
    event: eventLoader,
    external: externalLoader,
    facility: facilityLoader,
    orgUnit: orgUnitLoader,
    thematic: thematicLoader,
    geoJsonUrl: geoJsonUrlLoader,
    trackedEntity: trackedEntityLoader,
}

// Returns loadLayer, used by the app (useLoadLayerWithRedux) and the plugin
// (plugin/Map.jsx). loadLayer never throws: a layer always finishes loading,
// with an error alert if something went wrong
export const useLoadLayer = () => {
    const { baseUrl, serverVersion } = useConfig()
    const engine = useDataEngine()
    const [analyticsEngine] = useState(() => Analytics.getAnalytics(engine))
    const {
        systemSettings: {
            keyAnalysisDigitGroupSeparator,
            KeyTrackedEntityInstanceMaxLimit,
            KeyTrackedEntityMaxLimit,
        },
        currentUser: {
            keyAnalysisDisplayProperty,
            id: userId,
            userOrgUnitIdsByKeyword,
        },
    } = useCachedData()
    const periodTypeData = useDataOutputPeriodTypes()

    // Thematic and event layers need the enabled period types first
    const canLoadLayer = useCallback(
        (config) =>
            !(
                periodTypeData?.supportsEnabledPeriodTypes &&
                !periodTypeData?.enabledPeriodTypesData &&
                [THEMATIC_LAYER, EVENT_LAYER].includes(config.layer)
            ),
        [periodTypeData]
    )

    const loadLayer = useCallback(
        async (layer, { loadExtended = false } = {}) => {
            // The previous load's alerts must not come back with the new result
            const config = { ...layer, alerts: undefined, loadError: undefined }

            try {
                const loader = LOADERS[config.layer]
                if (!loader) {
                    throw new Error(`Unknown layer type: ${config.layer}`)
                }
                return await loader({
                    config,
                    engine,
                    keyAnalysisDisplayProperty, // name/shortName
                    keyAnalysisDigitGroupSeparator, // NONE/SPACE/COMMA
                    userId,
                    userOrgUnitIdsByKeyword, // Event loader
                    baseUrl,
                    analyticsEngine, // Thematic, Event and Tracked entity loader
                    periodTypeData, // Thematic and Event loader
                    serverVersion, // Tracked entity loader
                    KeyTrackedEntityInstanceMaxLimit, // Tracked entity loader (2.40)
                    KeyTrackedEntityMaxLimit, // Tracked entity loader
                    loadExtended, // Event loader
                })
            } catch (error) {
                console.error(error)
                return {
                    ...config,
                    name: config.name || i18n.t('Layer'),
                    data: [],
                    alerts: [createLayerAlertFromError(error)],
                    isLoaded: true,
                    isLoading: false,
                    isExpanded: true,
                }
            }
        },
        [
            engine,
            keyAnalysisDisplayProperty,
            keyAnalysisDigitGroupSeparator,
            userId,
            userOrgUnitIdsByKeyword,
            baseUrl,
            analyticsEngine,
            periodTypeData,
            serverVersion,
            KeyTrackedEntityInstanceMaxLimit,
            KeyTrackedEntityMaxLimit,
        ]
    )

    return { loadLayer, canLoadLayer }
}
