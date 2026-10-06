import { Analytics, useDataOutputPeriodTypes } from '@dhis2/analytics'
import { useDataEngine, useConfig } from '@dhis2/app-runtime'
import { useCallback, useState } from 'react'
import { useCachedData } from '../components/cachedDataProvider/CachedDataProvider.jsx'
import { THEMATIC_LAYER, EVENT_LAYER } from '../constants/layers.js'
import { loadLayer } from '../loaders/loadLayer.js'

// Loads layers with what the loaders need, for the app and the plugin (no redux)
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

    const load = useCallback(
        (config, { loadExtended = false } = {}) =>
            loadLayer(config, {
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
            }),
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

    return { loadLayer: load, canLoadLayer }
}
