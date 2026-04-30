import i18n from '@dhis2/d2-i18n'
import { scaleSqrt } from 'd3-scale'
import { findIndex } from 'lodash/fp'
import {
    WARNING_NO_DATA,
    WARNING_NO_OU_COORD,
    WARNING_NO_GEOMETRY_COORD,
    ERROR_CRITICAL,
} from '../constants/alerts.js'
import { dimConf } from '../constants/dimension.js'
import { EVENT_STATUS_COMPLETED } from '../constants/eventStatuses.js'
import {
    THEMATIC_BUBBLE,
    THEMATIC_RADIUS_DEFAULT,
    THEMATIC_RADIUS_LOW,
    THEMATIC_RADIUS_HIGH,
    RENDERING_STRATEGY_SINGLE,
    CLASSIFICATION_PREDEFINED,
    CLASSIFICATION_SINGLE_COLOR,
    CLASSIFICATION_LOGARITHMIC,
    CLASSIFICATION_STANDARD_DEVIATION,
    ORG_UNIT_COLOR,
    ORG_UNIT_RADIUS_SMALL,
} from '../constants/layers.js'
import {
    getOrgUnitsFromRows,
    getPeriodsFromFilters,
    getValidDimensionsFromFilters,
    getDataItemFromColumns,
    getApiResponseNames,
} from '../util/analytics.js'
import { getLegendItemForValue } from '../util/classify.js'
import { parseJsonConfig } from '../util/config.js'
import { hasValue } from '../util/helpers.js'
import {
    getPredefinedLegendItems,
    getAutomaticLegendItems,
    buildIsolatedLegendItem,
    isRegularLegendItem,
} from '../util/legend.js'
import { toGeoJson } from '../util/map.js'
import {
    formatRangeWithSeparator,
    formatWithSeparator,
} from '../util/numbers.js'
import {
    getCoordinateField,
    addAssociatedGeometries,
} from '../util/orgUnits.js'
import { LEGEND_SET_QUERY, GEOFEATURES_QUERY } from '../util/requests.js'
import { trimTime, formatStartEndDate, getDateArray } from '../util/time.js'

const thematicLoader = async ({
    config,
    engine,
    keyAnalysisDisplayProperty,
    keyAnalysisDigitGroupSeparator,
    userId,
    analyticsEngine,
    periodTypeData,
}) => {
    // Config parsing
    // -----

    const {
        columns,
        radiusLow = THEMATIC_RADIUS_LOW,
        radiusHigh = THEMATIC_RADIUS_HIGH,
        classes,
        colorScale,
        renderingStrategy = RENDERING_STRATEGY_SINGLE,
        thematicMapType,
    } = config

    const dataItem = getDataItemFromColumns(columns)
    const coordinateField = getCoordinateField(config)

    const {
        legendDecimalPlaces,
        legendIsolated,
        unclassifiedLegend: unclassifiedLegendFromConfig,
        noDataLegend: noDataLegendFromConfig,
    } = parseJsonConfig(config.config)
    if (legendDecimalPlaces !== undefined) {
        config.legendDecimalPlaces = legendDecimalPlaces
    }
    if (legendIsolated) {
        config.legendIsolated = legendIsolated
    }
    if (unclassifiedLegendFromConfig) {
        config.unclassifiedLegend = unclassifiedLegendFromConfig
    }
    if (noDataLegendFromConfig) {
        config.noDataLegend = noDataLegendFromConfig
    }
    if (config.noDataColor) {
        config.noDataLegend = {
            ...noDataLegendFromConfig,
            color: config.noDataColor,
        }
    }
    delete config.noDataColor
    delete config.config

    // Resolve legendSet and method (favorites may have the wrong method)
    const legendSet = await resolveLegendSet(config, dataItem, engine)
    const method = legendSet ? CLASSIFICATION_PREDEFINED : config.method

    // Set flags to navigate paths
    // -----

    // Rendering: Single | Timeline / Split
    const isSingleMap = renderingStrategy === RENDERING_STRATEGY_SINGLE
    // Map type: Choropleth | Bubble
    const isBubbleMap = thematicMapType === THEMATIC_BUBBLE
    // Classification: Predefined legend set | Automatic | Single [only for Bubble]
    const isPredefined = method === CLASSIFICATION_PREDEFINED
    const isSingleColor = method === CLASSIFICATION_SINGLE_COLOR
    // Special items:
    // - Isolated class configured [only for Automatic and Single] | not
    const hasIsolatedClass = !!config.legendIsolated
    // - No data class configured | not
    const hasNoDataClass = !!config.noDataLegend
    // - Unclassified class configured | not
    const hasUnclassifiedClass = !!config.unclassifiedLegend

    // Data loading
    // -----

    let loadError
    const response = await loadData({
        config,
        engine,
        keyAnalysisDisplayProperty,
        userId,
        analyticsEngine,
    }).catch((err) => {
        loadError = err

        if (err.message) {
            loadError =
                err.errorCode === 'E7124' && err.message.includes('dx')
                    ? i18n.t('Data item was not found')
                    : err.message
        }
    })

    if (!response) {
        return {
            ...config,
            ...(loadError
                ? {
                      alerts: [
                          {
                              code: ERROR_CRITICAL,
                              message: loadError,
                          },
                      ],
                  }
                : {}),
            name: dataItem ? dataItem.name : i18n.t('Thematic layer'),
            data: [],
            legend: null,
            isLoaded: true,
            isLoading: false,
            isVisible: true,
            loadError,
        }
    }

    // Data setup
    // -----

    const [mainFeatures, data, associatedGeometries] = response
    const valueById = getValueById(data)
    const valuesByPeriod = !isSingleMap ? getValuesByPeriod(data) : null // [PATH] null → Single; populated → Timeline / Split (do not creates OrgUnits with no data)

    const names = getApiResponseNames(
        periodTypeData?.enabledPeriodTypesData?.metaData
            ? {
                  ...data,
                  metaData: {
                      ...data.metaData,
                      items: {
                          ...data.metaData?.items,
                          ...periodTypeData.enabledPeriodTypesData.metaData,
                      },
                  },
              }
            : data
    )
    const name = names[dataItem.id]

    const presetPeriods = getPeriodsFromFilters(config.filters).map((pe) => {
        pe.name = names[pe.id]
        return pe
    })
    const periods = getPeriodsFromMetaData(data.metaData)
    const dimensions = getValidDimensionsFromFilters(config.filters)

    const orderedValues = getOrderedValues(data)
    let minValue = orderedValues[0]
    let maxValue = orderedValues.at(-1)

    let features = addAssociatedGeometries(mainFeatures, associatedGeometries)

    // Alerts
    // -----

    const alerts = []

    if (!features.length) {
        alerts.push({
            code: WARNING_NO_OU_COORD,
            message: i18n.t('Thematic layer'),
        })
    } else if (!data.rows.length) {
        alerts.push({
            code: WARNING_NO_DATA,
            message: name,
        })
    }

    if (coordinateField && !associatedGeometries.length) {
        alerts.push({
            code: WARNING_NO_GEOMETRY_COORD,
            message: coordinateField.name,
        })
    }

    // Legend
    // -----

    let legendItems = []
    let valueFormat

    if (isPredefined) {
        legendItems = getPredefinedLegendItems(legendSet)
    } else if (!isSingleColor) {
        const classification = getAutomaticLegendItems({
            data: orderedValues,
            method,
            classes,
            colorScale,
            legendDecimalPlaces: config.legendDecimalPlaces,
            legendIsolated: config.legendIsolated,
        })
        legendItems = classification.items
        valueFormat = classification.valueFormat
    } else if (hasIsolatedClass) {
        const { min, max } = config.legendIsolated
        legendItems = [buildIsolatedLegendItem(config.legendIsolated)]
        const nonIsolatedValues = orderedValues.filter(
            (v) => v < min || v > max
        )
        if (nonIsolatedValues.length > 0) {
            minValue = nonIsolatedValues[0]
            maxValue = nonIsolatedValues.at(-1)
        }
    }

    const legend = {
        title: name,
        period:
            presetPeriods.length > 0
                ? presetPeriods.map((pe) => pe.name || pe.id).join(', ')
                : formatStartEndDate(
                      getDateArray(config.startDate),
                      getDateArray(config.endDate)
                  ),
        items: legendItems,
        decimalPlaces: config.legendDecimalPlaces,
    }

    if (dimensions && dimensions.length) {
        legend.filters = dimensions.map(
            (d) =>
                `${names[d.dimension]}: ${d.items
                    .map((i) => names[i.id])
                    .join(', ')}`
        )
    }

    if (isBubbleMap) {
        legend.bubbles = {
            radiusLow,
            radiusHigh,
            minValue,
            maxValue,
            color: isSingleColor ? colorScale : null,
            legendDecimalPlaces: config.legendDecimalPlaces,
        }
        if (!isSingleColor) {
            const regularItems = legend.items.filter(isRegularLegendItem)
            if (regularItems.length) {
                minValue = regularItems[0].startValue
                maxValue = regularItems.at(-1).endValue
                legend.bubbles.minValue ??= minValue
                legend.bubbles.maxValue ??= maxValue
            }
        }
    }

    let noDataLegendItem = null
    if (hasNoDataClass) {
        noDataLegendItem = {
            color: config.noDataLegend.color,
            name: config.noDataLegend.name || i18n.t('No data'),
            isNoData: true,
        }
        legend.items.push(noDataLegendItem)
    }

    let unclassifiedLegendItem = null
    if (hasUnclassifiedClass) {
        unclassifiedLegendItem = {
            color: config.unclassifiedLegend.color,
            name: config.unclassifiedLegend.name || i18n.t('Unclassified'),
            isUnclassified: true,
        }
        legend.items.push(unclassifiedLegendItem)
    }

    // Counting for Timeline / Split would be ambiguous
    if (isSingleMap) {
        legend.items.forEach((item) => (item.count = 0))
    }

    // Feature styling - Helpers
    // -----

    // Returns the matching classified item, including isolated values, or undefined for no-data / unclassified values
    const getLegendItem = (value) =>
        getLegendItemForValue({
            value,
            valueFormat,
            method,
            legendItems: legend.items,
            clamp:
                !isPredefined &&
                method !== CLASSIFICATION_LOGARITHMIC &&
                method !== CLASSIFICATION_STANDARD_DEVIATION,
        })

    const getFeatureColor = (legendItem, { isNoData, isUnclassified }) => {
        if (legendItem) {
            return { color: legendItem.color }
        }
        if (isNoData) {
            return { color: noDataLegendItem.color }
        }
        if (isUnclassified) {
            return { color: unclassifiedLegendItem.color }
        }
        return { color: colorScale }
    }

    const getFeatureLegend = (legendItem, { isNoData, isUnclassified }) => {
        if (legendItem) {
            return {
                legend: legendItem.name,
                range: formatRangeWithSeparator(
                    legendItem,
                    keyAnalysisDigitGroupSeparator,
                    {
                        precision: config.legendDecimalPlaces,
                    }
                ),
            }
        }
        if (isNoData) {
            return { legend: noDataLegendItem.name }
        }
        if (isUnclassified) {
            return { legend: unclassifiedLegendItem.name }
        }
        return {}
    }

    const getRadiusForValue = scaleSqrt()
        .range([radiusLow, radiusHigh])
        .domain([minValue, maxValue])
        .clamp(true)

    const getFeatureRadius = (
        legendItem,
        { isNoData, isUnclassified },
        value
    ) => {
        if (legendItem?.isIsolated || isNoData || isUnclassified) {
            return { radius: THEMATIC_RADIUS_DEFAULT }
        }
        return { radius: getRadiusForValue(value) || THEMATIC_RADIUS_DEFAULT }
    }

    const countLegendItem = (legendItem, { isNoData, isUnclassified }) => {
        const item =
            legendItem ??
            (isNoData
                ? noDataLegendItem
                : isUnclassified
                ? unclassifiedLegendItem
                : null)
        if (item) {
            item.count++
        }
    }

    // Feature styling - Processing
    // -----

    if (!isSingleMap) {
        const periods = Object.keys(valuesByPeriod)
        periods.forEach((period) => {
            const orgUnits = Object.keys(valuesByPeriod[period])
            orgUnits.forEach((orgunit) => {
                const item = valuesByPeriod[period][orgunit]
                const value = Number(item.value)
                const legendItem = getLegendItem(value)
                const isNoData = !hasValue(item.value)
                const isUnclassified =
                    !isSingleColor && !legendItem && !isNoData

                // No data org units are absent from valuesByPeriod;
                if (isUnclassified && !hasUnclassifiedClass) {
                    Object.assign(item, { isUnclassified: true })
                    return
                }
                // ThematicLayer handles no data and unclassified inclusion/exclusion

                Object.assign(item, {
                    ...getFeatureColor(legendItem, {
                        isNoData,
                        isUnclassified,
                    }),
                    ...getFeatureRadius(
                        legendItem,
                        { isNoData, isUnclassified },
                        value
                    ),
                })
            })
        })
    } else {
        // Style and filter features in place
        features = features.flatMap(({ id, geometry, properties }) => {
            const value = valueById[id]
            const legendItem = getLegendItem(value)
            const isNoData = !hasValue(value)
            const isUnclassified = !isSingleColor && !legendItem && !isNoData

            if (isNoData && !hasNoDataClass) {
                return []
            }
            if (isUnclassified && !hasUnclassifiedClass) {
                return []
            }

            const isPoint = geometry.type === 'Point'
            const { hasAdditionalGeometry } = properties

            Object.assign(properties, {
                ...getFeatureColor(legendItem, { isNoData, isUnclassified }),
                ...getFeatureLegend(legendItem, { isNoData, isUnclassified }),
                ...getFeatureRadius(
                    legendItem,
                    {
                        isNoData,
                        isUnclassified,
                    },
                    value
                ),
                ...(hasAdditionalGeometry &&
                    legendItem &&
                    isPoint && { color: ORG_UNIT_COLOR }),
                ...(hasAdditionalGeometry && {
                    radius: ORG_UNIT_RADIUS_SMALL,
                }),
                value: formatWithSeparator(
                    value,
                    keyAnalysisDigitGroupSeparator
                ), // Shown in tooltip, label, pop-up, data table
                rawValue: value, // Numeric form for data table sorting
            })

            if (!hasAdditionalGeometry) {
                countLegendItem(legendItem, { isUnclassified, isNoData })
            }

            return [{ id, geometry, properties }]
        })
    }

    return {
        ...config,
        data: features,
        periods,
        valuesByPeriod,
        name,
        legend,
        method,
        alerts,
        isLoaded: true,
        isLoading: false,
        isExpanded: true,
        isVisible: true,
        loadError,
    }
}

// Resolves the legendSet to use: config > dataItem fallback (when no explicit method),
// then fetches the full legendSet from the server. Returns null if not found or deleted.
const resolveLegendSet = async (config, dataItem, engine) => {
    const legendSet =
        config.legendSet ?? (!config.method ? dataItem.legendSet : null)
    if (!legendSet) {
        return null
    }
    const result = await engine.query(LEGEND_SET_QUERY, {
        variables: { id: legendSet.id },
    })
    return result.legendSet ?? null
}

const getPeriodsFromMetaData = ({ dimensions, items }) =>
    dimensions.pe.map((id) => {
        const { name, startDate, endDate } = items[id]

        const newEndDate = new Date(endDate)

        // Set to midnight to include the last day
        newEndDate.setHours(24)

        return {
            id,
            name,
            startDate: new Date(startDate),
            endDate: newEndDate,
        }
    })

const getValuesByPeriod = (data) => {
    const { headers, rows } = data
    const periodIndex = findIndex(['name', 'pe'], headers)
    const ouIndex = findIndex(['name', 'ou'], headers)
    const valueIndex = findIndex(['name', 'value'], headers)

    return rows.reduce((obj, row) => {
        const period = row[periodIndex]
        const periodObj = (obj[period] = obj[period] || {})
        periodObj[row[ouIndex]] = {
            value: row[valueIndex],
        }
        return obj
    }, {})
}

// Returns an object mapping org. units and values
const getValueById = (data) => {
    const { headers, rows } = data
    const ouIndex = findIndex(['name', 'ou'], headers)
    const valueIndex = findIndex(['name', 'value'], headers)

    return rows.reduce((obj, row) => {
        obj[row[ouIndex]] = parseFloat(row[valueIndex])
        return obj
    }, {})
}

// Returns an array of ordered values
const getOrderedValues = (data) => {
    const { headers, rows } = data
    const valueIndex = findIndex(['name', 'value'], headers)

    return rows.map((row) => parseFloat(row[valueIndex])).sort((a, b) => a - b)
}

// Load features and data values from api
const loadData = async ({
    config,
    engine,
    keyAnalysisDisplayProperty,
    userId,
    analyticsEngine,
}) => {
    const {
        rows,
        columns,
        filters,
        startDate,
        endDate,
        valueType,
        relativePeriodDate,
        aggregationType,
        renderingStrategy = RENDERING_STRATEGY_SINGLE,
        eventStatus,
    } = config
    const orgUnits = getOrgUnitsFromRows(rows)
    const presetPeriods = getPeriodsFromFilters(filters)
    const dimensions = getValidDimensionsFromFilters(config.filters)
    const dataItem = getDataItemFromColumns(columns) || {}
    const coordinateField = getCoordinateField(config)
    const isOperand = columns[0].dimension === dimConf.operand.objectName
    const isSingleMap = renderingStrategy === RENDERING_STRATEGY_SINGLE
    const orgUnitIds = orgUnits.map((item) => item.id)
    let dataDimension = isOperand ? dataItem.id.split('.')[0] : dataItem.id

    if (valueType === 'ds') {
        dataDimension += '.REPORTING_RATE'
    }

    let analyticsRequest = new analyticsEngine.request()
        .addOrgUnitDimension(orgUnits.map((ou) => ou.id))
        .addDataDimension(dataDimension)
        .withDisplayProperty(keyAnalysisDisplayProperty) // name/shortName

    if (!isSingleMap) {
        analyticsRequest = analyticsRequest.addPeriodDimension(
            presetPeriods.map((pe) => pe.id)
        )
    } else {
        analyticsRequest =
            presetPeriods.length > 0
                ? analyticsRequest.addPeriodFilter(
                      presetPeriods.map((pe) => pe.id)
                  )
                : analyticsRequest
                      .withStartDate(trimTime(startDate))
                      .withEndDate(trimTime(endDate))
    }

    if (dimensions) {
        dimensions.forEach(
            (d) =>
                (analyticsRequest = analyticsRequest.addFilter(
                    d.dimension,
                    d.items.map((i) => i.id)
                ))
        )
    }

    if (relativePeriodDate) {
        analyticsRequest =
            analyticsRequest.withRelativePeriodDate(relativePeriodDate)
    }

    if (aggregationType) {
        analyticsRequest = analyticsRequest.withAggregationType(aggregationType)
    }

    if (isOperand) {
        analyticsRequest = analyticsRequest.addDimension('co')
    }

    if (eventStatus === EVENT_STATUS_COMPLETED) {
        analyticsRequest = analyticsRequest.withParameters({
            completedOnly: true,
        })
    }

    const rawData = await analyticsEngine.aggregate.get(analyticsRequest)

    const geoFeatureData = await engine.query(GEOFEATURES_QUERY, {
        variables: {
            orgUnitIds,
            keyAnalysisDisplayProperty,
            userId,
        },
    })

    const mainFeatures = geoFeatureData?.geoFeatures
        ? toGeoJson(geoFeatureData.geoFeatures)
        : null

    let associatedGeometries

    if (coordinateField) {
        // Associated geometry request
        const coordFieldData = await engine.query(GEOFEATURES_QUERY, {
            variables: {
                orgUnitIds,
                keyAnalysisDisplayProperty, // name/shortName
                coordinateField: coordinateField.id,
                userId,
            },
        })

        associatedGeometries = coordFieldData?.geoFeatures
            ? toGeoJson(coordFieldData.geoFeatures)
            : null
    }

    return [
        mainFeatures,
        new analyticsEngine.response(rawData),
        associatedGeometries,
    ]
}

export default thematicLoader
