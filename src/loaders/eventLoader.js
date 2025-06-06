import i18n from '@dhis2/d2-i18n'
import { CUSTOM_ALERT, WARNING_NO_DATA } from '../constants/alerts.js'
import { getEventStatuses } from '../constants/eventStatuses.js'
import {
    EVENT_CLIENT_PAGE_SIZE,
    EVENT_SERVER_CLUSTER_COUNT,
    EVENT_COLOR,
    EVENT_RADIUS,
} from '../constants/layers.js'
import { numberValueTypes } from '../constants/valueTypes.js'
import {
    getFiltersFromColumns,
    getFiltersAsText,
    getPeriodFromFilters,
    getPeriodNameFromId,
} from '../util/analytics.js'
import { cssColor, getContrastColor } from '../util/colors.js'
import { loadEventCoordinateFieldName } from '../util/coordinatesName.js'
import { getAnalyticsRequest, loadData } from '../util/event.js'
import { getBounds } from '../util/geojson.js'
import { OPTION_SET_QUERY } from '../util/requests.js'
import { styleByDataItem } from '../util/styleByDataItem.js'
import { formatStartEndDate, getDateArray } from '../util/time.js'
import { isValidUid } from '../util/uid.js'

// Server clustering if more than 2000 events
const shouldUseServerCluster = (count) => count > EVENT_SERVER_CLUSTER_COUNT

const accessDeniedAlert = {
    warning: true,
    code: CUSTOM_ALERT,
    message: i18n.t("You don't have access to this layer data"),
}
const filterErrorAlert = {
    warning: true,
    code: CUSTOM_ALERT,
    message: i18n.t('The event filter is not supported'),
}
const unknownErrorAlert = {
    critical: true,
    code: CUSTOM_ALERT,
    message: i18n.t('An unknown error occurred while reading layer data'),
}

// Returns a promise
const eventLoader = async ({
    config: layerConfig,
    engine,
    keyAnalysisDisplayProperty,
    analyticsEngine,
    loadExtended,
}) => {
    const config = { ...layerConfig }
    const displayNameProp =
        keyAnalysisDisplayProperty === 'name'
            ? 'displayName'
            : 'displayShortName'

    try {
        await loadEventLayer({
            config,
            engine,
            displayNameProp,
            analyticsEngine,
            loadExtended,
        })
    } catch (e) {
        if (
            e.details?.httpStatusCode === 403 ||
            e.details?.httpStatusCode === 409
        ) {
            config.alerts = [
                e.details?.message.includes('filter is invalid')
                    ? filterErrorAlert
                    : accessDeniedAlert,
            ]
        } else {
            config.alerts = [unknownErrorAlert]
        }
    }

    config.isLoaded = true
    config.isLoading = false
    config.isExpanded = true
    config.isVisible = true

    return config
}

const loadEventLayer = async ({
    config,
    engine,
    displayNameProp,
    analyticsEngine,
    loadExtended,
}) => {
    const {
        columns,
        endDate,
        eventStatus,
        eventClustering,
        eventPointColor,
        eventPointRadius,
        filters,
        program,
        programStage,
        eventCoordinateField,
        startDate,
        styleDataItem,
        areaRadius,
    } = config

    const period = getPeriodFromFilters(filters)
    const dataFilters = getFiltersFromColumns(columns)

    config.isExtended = loadExtended

    const analyticsRequest = await getAnalyticsRequest(config, {
        analyticsEngine,
        nameProperty: displayNameProp,
        engine,
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
    if (eventClustering && !styleDataItem) {
        const response = await analyticsEngine.events.getCount(analyticsRequest)
        config.bounds = getBounds(response.extent)
        config.serverCluster = shouldUseServerCluster(response.count)
    }

    if (!config.serverCluster) {
        config.outputIdScheme = 'ID' // Required for StyleByDataItem to work
        const { names, data, response } = await loadData({
            request: analyticsRequest,
            config,
            analyticsEngine,
        })
        const { total } = response.metaData.pager

        config.data = data

        if (Array.isArray(config.data) && config.data.length) {
            if (styleDataItem) {
                await styleByDataItem(config, engine)
            }

            if (total > EVENT_CLIENT_PAGE_SIZE) {
                alert = {
                    warning: true,
                    code: CUSTOM_ALERT,
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
                code: WARNING_NO_DATA,
                message: config.name,
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
                    engine
                )),
            })

        const eventCoordinateFieldName = await loadEventCoordinateFieldName({
            program,
            programStage,
            eventCoordinateField,
            engine,
            displayNameProp,
        })
        if (eventCoordinateFieldName) {
            config.legend.coordinateFields = [eventCoordinateFieldName]
        }

        config.headers = response.headers

        const numericDataItemHeaders = config.headers.filter(
            (header) =>
                isValidUid(header.name) &&
                numberValueTypes.includes(header.valueType)
        )

        if (numericDataItemHeaders.length) {
            config.data = config.data.map((d) => {
                const newD = { ...d }

                numericDataItemHeaders.forEach((header) => {
                    newD.properties[header.name] = parseFloat(
                        d.properties[header.name]
                    )
                })

                return newD
            })
        }
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
                count: Array.isArray(config?.data) ? config.data.length : 0,
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
const getFilterOptionNames = async (filters, headers, engine) => {
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

    const allOptionSets = await Promise.all(
        optionSets.map((id) =>
            engine.query(OPTION_SET_QUERY, {
                variables: { id },
            })
        )
    )

    // Returns one object with all option codes mapped to names
    return allOptionSets
        .map(({ optionSet }) =>
            optionSet.options.reduce((obj, { code, name }) => {
                obj[code] = name
                return obj
            }, {})
        )
        .reduce(
            (obj, set) => ({
                ...obj,
                ...set,
            }),
            {}
        )
}

export default eventLoader
