import i18n from '@dhis2/d2-i18n'
import { getInstance as getD2 } from 'd2'
import { scaleSqrt } from 'd3-scale'
import { findIndex, curry } from 'lodash/fp'
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
    THEMATIC_RADIUS_LOW,
    THEMATIC_RADIUS_HIGH,
    RENDERING_STRATEGY_SINGLE,
    CLASSIFICATION_PREDEFINED,
    CLASSIFICATION_SINGLE_COLOR,
    ORG_UNIT_COLOR,
    ORG_UNIT_RADIUS_SMALL,
    NO_DATA_COLOR,
} from '../constants/layers.js'
import {
    getOrgUnitsFromRows,
    getPeriodsFromFilters,
    getValidDimensionsFromFilters,
    getDataItemFromColumns,
    getApiResponseNames,
} from '../util/analytics.js'
import { getLegendItemForValue } from '../util/classify.js'
import {
    getPredefinedLegendItems,
    getAutomaticLegendItems,
} from '../util/legend.js'
import { toGeoJson } from '../util/map.js'
import {
    getCoordinateField,
    addAssociatedGeometries,
} from '../util/orgUnits.js'
import { LEGEND_SET_QUERY } from '../util/requests.js'
import { formatStartEndDate, getDateArray } from '../util/time.js'

const thematicLoader = async ({ config, engine, nameProperty }) => {
    const {
        columns,
        radiusLow = THEMATIC_RADIUS_LOW,
        radiusHigh = THEMATIC_RADIUS_HIGH,
        classes,
        colorScale,
        renderingStrategy = RENDERING_STRATEGY_SINGLE,
        thematicMapType,
        noDataColor,
    } = config

    const dataItem = getDataItemFromColumns(columns)
    const coordinateField = getCoordinateField(config)

    let loadError

    const response = await loadData(config, nameProperty).catch((err) => {
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

    const [mainFeatures, data, associatedGeometries] = response
    const features = addAssociatedGeometries(mainFeatures, associatedGeometries)
    const isSingleMap = renderingStrategy === RENDERING_STRATEGY_SINGLE
    const isBubbleMap = thematicMapType === THEMATIC_BUBBLE
    const isSingleColor = config.method === CLASSIFICATION_SINGLE_COLOR
    const presetPeriods = getPeriodsFromFilters(config.filters)
    const periods = getPeriodsFromMetaData(data.metaData)
    const dimensions = getValidDimensionsFromFilters(config.filters)
    const names = getApiResponseNames(data)
    const valuesByPeriod = !isSingleMap ? getValuesByPeriod(data) : null
    const valueById = getValueById(data)
    const valueFeatures = noDataColor
        ? features
        : features.filter(({ id }) => valueById[id] !== undefined)
    const orderedValues = getOrderedValues(data)
    let minValue = orderedValues[0]
    let maxValue = orderedValues[orderedValues.length - 1]
    const name = names[dataItem.id]
    const alerts = []

    let legendSet = config.legendSet

    // Use legend set defined for data item as default
    if (
        !legendSet &&
        dataItem.legendSet &&
        (config.method === undefined ||
            config.method === CLASSIFICATION_PREDEFINED)
    ) {
        legendSet = dataItem.legendSet
    }

    // Favorites often have wrong method
    const method = legendSet ? CLASSIFICATION_PREDEFINED : config.method

    if (legendSet) {
        const result = await engine.query(LEGEND_SET_QUERY, {
            variables: { id: config.legendSet.id },
        })
        legendSet = result.legendSet
    }

    let legendItems = []

    if (!isSingleColor) {
        legendItems = legendSet
            ? getPredefinedLegendItems(legendSet)
            : getAutomaticLegendItems(
                  orderedValues,
                  method,
                  classes,
                  colorScale
              )
    }

    const legend = {
        title: name,
        period:
            presetPeriods.length > 0
                ? presetPeriods.map((pe) => names[pe.id] || pe.id).join(', ')
                : formatStartEndDate(
                      getDateArray(config.startDate),
                      getDateArray(config.endDate)
                  ),
        items: legendItems,
    }

    if (dimensions && dimensions.length) {
        legend.filters = dimensions.map(
            (d) =>
                `${names[d.dimension]}: ${d.items
                    .map((i) => names[i.id])
                    .join(', ')}`
        )
    }

    if (isSingleMap) {
        legend.items.forEach((item) => (item.count = 0))
    }

    if (isBubbleMap) {
        legend.bubbles = {
            radiusLow,
            radiusHigh,
            color: isSingleColor ? colorScale : null,
        }
    }

    const getLegendItem = curry(getLegendItemForValue)(legend.items)

    if (legendSet && Array.isArray(legend.items) && legend.items.length >= 2) {
        minValue = legend.items[0].startValue
        maxValue = legend.items[legend.items.length - 1].endValue
    }

    const getRadiusForValue = scaleSqrt()
        .range([radiusLow, radiusHigh])
        .domain([minValue, maxValue])
        .clamp(true)

    if (!valueFeatures.length) {
        if (!features.length) {
            alerts.push({
                code: WARNING_NO_OU_COORD,
                message: i18n.t('Thematic layer'),
            })
        } else {
            alerts.push({
                code: WARNING_NO_DATA,
                message: name,
            })
        }
    }

    if (coordinateField && !associatedGeometries.length) {
        alerts.push({
            code: WARNING_NO_GEOMETRY_COORD,
            message: coordinateField.name,
        })
    }

    if (valuesByPeriod) {
        const periods = Object.keys(valuesByPeriod)
        periods.forEach((period) => {
            const orgUnits = Object.keys(valuesByPeriod[period])
            orgUnits.forEach((orgunit) => {
                const item = valuesByPeriod[period][orgunit]
                const value = Number(item.value)
                const legend = getLegendItem(value)

                if (isSingleColor) {
                    item.color = colorScale
                } else {
                    item.color = legend ? legend.color : NO_DATA_COLOR
                }

                item.radius = getRadiusForValue(value)
            })
        })
    } else {
        valueFeatures.forEach(({ id, geometry, properties }) => {
            const value = valueById[id]
            const item = getLegendItem(value)
            const isPoint = geometry.type === 'Point'
            const { hasAdditionalGeometry } = properties

            if (isSingleColor) {
                properties.color = colorScale
            } else if (item) {
                // Only count org units once in legend
                if (!hasAdditionalGeometry) {
                    item.count++
                }
                properties.color =
                    hasAdditionalGeometry && isPoint
                        ? ORG_UNIT_COLOR
                        : item.color
                properties.legend = item.name // Shown in data table
                properties.range = `${item.startValue} - ${item.endValue}` // Shown in data table
            }

            properties.value = value
            properties.radius = hasAdditionalGeometry
                ? ORG_UNIT_RADIUS_SMALL
                : getRadiusForValue(value)
        })
    }

    if (noDataColor && Array.isArray(legend.items) && !isBubbleMap) {
        legend.items.push({ color: noDataColor, name: i18n.t('No data') })
    }

    return {
        ...config,
        data: valueFeatures,
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
const loadData = async (config, nameProperty) => {
    const {
        rows,
        columns,
        filters,
        startDate,
        endDate,
        userOrgUnit,
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
    const d2 = await getD2()

    const geoFeaturesParams = {}
    const orgUnitParams = orgUnits.map((item) => item.id)
    let dataDimension = isOperand ? dataItem.id.split('.')[0] : dataItem.id

    if (valueType === 'ds') {
        dataDimension += '.REPORTING_RATE'
    }

    let analyticsRequest = new d2.analytics.request()
        .addOrgUnitDimension(orgUnits.map((ou) => ou.id))
        .addDataDimension(dataDimension)
        .withDisplayProperty(nameProperty)

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
                      .withStartDate(startDate.slice(0, 10))
                      .withEndDate(endDate.slice(0, 10))
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

    if (Array.isArray(userOrgUnit) && userOrgUnit.length) {
        geoFeaturesParams.userOrgUnit = userOrgUnit.join(';')
        analyticsRequest = analyticsRequest.withUserOrgUnit(userOrgUnit)
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

    const featuresRequest = d2.geoFeatures
        .byOrgUnit(orgUnitParams)
        .displayProperty(nameProperty)

    // Features request
    const orgUnitReq = featuresRequest.getAll(geoFeaturesParams).then(toGeoJson)

    // Data request
    const dataReq = d2.analytics.aggregate.get(analyticsRequest)

    const requests = [orgUnitReq, dataReq]

    if (coordinateField) {
        // Associated geometry request
        requests.push(
            featuresRequest
                .getAll({
                    ...geoFeaturesParams,
                    coordinateField: coordinateField.id,
                })
                .then(toGeoJson)
        )
    }

    // Return promise with all requests
    return Promise.all(requests)
}

export default thematicLoader
