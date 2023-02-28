import i18n from '@dhis2/d2-i18n'
import { getEventStatuses } from '../constants/eventStatuses.js'
import {
    EVENT_CLIENT_PAGE_SIZE,
    EVENT_SERVER_CLUSTER_COUNT,
    EVENT_COLOR,
    EVENT_RADIUS,
} from '../constants/layers.js'
import {
    getFiltersFromColumns,
    getFiltersAsText,
    getPeriodFromFilters,
    getPeriodNameFromId,
} from '../util/analytics.js'
import { cssColor, getContrastColor } from '../util/colors.js'
import { getAnalyticsRequest, loadData } from '../util/event.js'
import { getBounds } from '../util/geojson.js'
import { styleByDataItem } from '../util/styleByDataItem.js'
import { formatStartEndDate, getDateArray } from '../util/time.js'

// Server clustering if more than 2000 events
const useServerCluster = (count) => count > EVENT_SERVER_CLUSTER_COUNT

const accessDeniedAlert = {
    warning: true,
    message: i18n.t("You don't have access to this layer data"),
}
const unknownErrorAlert = {
    critical: true,
    message: i18n.t('An unknown error occurred while reading layer data'),
}

// TODO: Refactor to share code with other loaders
// Returns a promise
const eventLoader = async (layerConfig, d2) => {
    const config = { ...layerConfig }
    try {
        await loadEventLayer(config, d2)
    } catch (e) {
        if (e.httpStatusCode === 403 || e.httpStatusCode === 409) {
            config.alerts = [accessDeniedAlert]
        } else {
            config.alerts = [unknownErrorAlert]
        }
    }

    config.isLoaded = true
    config.isExpanded = true
    config.isVisible = true

    return config
}

const loadEventLayer = async (config, d2) => {
    const {
        columns,
        endDate,
        eventStatus,
        eventClustering,
        eventPointColor,
        eventPointRadius,
        filters,
        programStage,
        startDate,
        styleDataItem,
        areaRadius,
        showDataTable,
    } = config

    const period = getPeriodFromFilters(filters)
    const dataFilters = getFiltersFromColumns(columns)
    const spatialSupport = d2.system.systemInfo.databaseInfo.spatialSupport

    config.isExtended = showDataTable

    const analyticsRequest = await getAnalyticsRequest(config, {
        d2,
        nameProperty: d2.currentUser.settings.keyAnalysisDisplayProperty,
    })
    let alert

    config.name = programStage.name

    config.legend = {
        title: config.name,
        period: period
            ? getPeriodNameFromId(period.id)
            : formatStartEndDate(
                  getDateArray(startDate),
                  getDateArray(endDate)
              ),
        items: [],
    }

    // Delete serverCluster option if previously set
    delete config.serverCluster

    // Check if events should be clustered on the server or the client
    // Style by data item is only supported in the client (donuts)
    if (spatialSupport && eventClustering && !styleDataItem) {
        const response = await d2.analytics.events.getCount(analyticsRequest)
        config.bounds = getBounds(response.extent)
        //FIXME
        //eslint-disable-next-line react-hooks/rules-of-hooks
        config.serverCluster = useServerCluster(response.count)
    }

    if (!config.serverCluster) {
        config.outputIdScheme = 'ID' // Required for StyleByDataItem to work
        const { names, data, response } = await loadData(
            analyticsRequest,
            config,
            d2
        )
        const { total } = response.metaData.pager

        config.data = data

        if (Array.isArray(config.data) && config.data.length) {
            if (styleDataItem) {
                await styleByDataItem(config, d2)
            }

            if (total > EVENT_CLIENT_PAGE_SIZE) {
                alert = {
                    warning: true,
                    message: `${config.name}: ${i18n.t(
                        'Displaying first {{pageSize}} events out of {{total}}',
                        {
                            pageSize: EVENT_CLIENT_PAGE_SIZE,
                            total,
                        }
                    )}`,
                }
            }
        } else {
            alert = {
                warning: true,
                message: `${config.name}: ${i18n.t('No data found')}`,
            }
        }

        // TODO: Add filters to legend when using server cluster
        // Currently not done as names are not available
        config.legend.filters =
            dataFilters &&
            getFiltersAsText(dataFilters, {
                ...names,
                ...(await getFilterOptionNames(
                    dataFilters,
                    response.headers,
                    d2
                )),
            })

        config.headers = response.headers
    }

    if (!styleDataItem) {
        const color = cssColor(eventPointColor) || EVENT_COLOR
        const strokeColor = getContrastColor(color)

        config.legend.items = [
            {
                name: i18n.t('Event'),
                color,
                strokeColor,
                radius: eventPointRadius || EVENT_RADIUS,
            },
        ]
    }

    const explanation = []

    if (eventStatus) {
        explanation.push(
            `${i18n.t('Event status')}: ${
                getEventStatuses().find((s) => s.id === eventStatus).name
            }`
        )
    }

    if (areaRadius) {
        explanation.push(`${i18n.t('Buffer')}: ${areaRadius} ${'m'}`)
    }

    if (explanation.length) {
        config.legend.explanation = explanation
    }

    if (alert) {
        config.alerts = [alert]
    }
}

// If the layer included filters using option sets, this function return an object
// mapping option codes to named used to translate codes in the legend
const getFilterOptionNames = async (filters, headers, d2) => {
    if (!filters) {
        return null
    }

    // Returns array of option set ids used for filtering
    const optionSets = filters
        .map((filter) =>
            headers.find((header) => header.name === filter.dimension)
        )
        .filter((header) => header.optionSet)
        .map((header) => header.optionSet)

    if (!optionSets.length) {
        return
    }

    const mappedOptionSets = await Promise.all(
        optionSets.map((id) =>
            d2.models.optionSets
                .get(id, {
                    fields: 'options[code,displayName~rename(name)]',
                })
                .then((model) => model.options)
                .then((options) =>
                    options.reduce((obj, { code, name }) => {
                        obj[code] = name
                        return obj
                    }, {})
                )
        )
    )

    // Returns one object with all option codes mapped to names
    return mappedOptionSets.reduce(
        (obj, set) => ({
            ...obj,
            ...set,
        }),
        {}
    )
}

export default eventLoader
