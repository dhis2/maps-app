import i18n from '@dhis2/d2-i18n'
import { CUSTOM_ALERT } from '../constants/alerts.js'
import { parseJsonConfig } from '../util/config.js'
import {
    fetchCollection,
    fetchOpenClimateServiceUrl,
    fetchStyle,
    getDefaultSelection,
    getDimensions,
    getLegendColors,
    getRenderOptions,
    getSelectionIndexes,
    getSelectionName,
    getVectorColor,
    getVectorOptions,
    isVectorCollection,
} from '../util/openClimateService.js'
import { createLegend } from './earthEngineLoader.js'

const openClimateServiceLoader = async ({
    config: layer,
    engine,
    keyAnalysisDigitGroupSeparator,
}) => {
    // Saved maps store the config as a JSON string
    const config =
        typeof layer.config === 'string'
            ? parseJsonConfig(layer.config)
            : { ...layer.config }
    const { datasetId } = config

    const onError = (message) => ({
        ...layer,
        config,
        alerts: [
            {
                code: CUSTOM_ALERT,
                critical: true,
                message: `${layer.name || datasetId}: ${message}`,
            },
        ],
        isLoaded: true,
        isLoading: false,
    })

    const url = await fetchOpenClimateServiceUrl(engine)

    let collection

    try {
        collection = await fetchCollection(url, datasetId)
    } catch {
        return onError(
            i18n.t('The dataset is not available from {{url}}', { url })
        )
    }

    const name = collection.title || datasetId
    const legendSource = {
        title: name,
        description: collection.description,
        source: 'Open Climate Service',
        sourceUrl: `${url}/datasets/${encodeURIComponent(datasetId)}`,
    }

    // A vector collection is drawn from its vector tiles, with the style OCS publishes
    if (isVectorCollection(collection)) {
        let style
        try {
            style = await fetchStyle(collection)
        } catch {
            return onError(
                i18n.t('The map style of the dataset is not available')
            )
        }
        const render = getVectorOptions(collection, style)
        return {
            ...layer,
            name,
            config,
            render,
            legend: {
                ...legendSource,
                items: [
                    {
                        color: getVectorColor(style),
                        name: i18n.t('{{count}} features', {
                            count: render.featureCount ?? 0,
                        }),
                    },
                ],
            },
            isLoaded: true,
            isLoading: false,
            isExpanded: true,
        }
    }

    const dimensions = getDimensions(collection)
    const selection = {
        ...getDefaultSelection(dimensions),
        ...config.selection,
    }
    const render = getRenderOptions(collection)

    const legend = {
        ...legendSource,
        period: getSelectionName(dimensions, selection),
        unit: render.unit,
        items: createLegend(
            {
                min: render.min,
                max: render.max,
                palette: getLegendColors(render.colormapName),
            },
            false,
            keyAnalysisDigitGroupSeparator
        ),
    }

    return {
        ...layer,
        name,
        // A dimension without a saved value follows the latest data
        config,
        dimensions,
        render: {
            ...render,
            selector: getSelectionIndexes(dimensions, selection),
        },
        legend,
        isLoaded: true,
        isLoading: false,
        isExpanded: true,
    }
}

export default openClimateServiceLoader
