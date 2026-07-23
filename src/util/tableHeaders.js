import i18n from '@dhis2/d2-i18n'
import {
    RENDERER_COLOR,
    RENDERER_ICON,
    RENDERER_DATE,
    TYPE_NUMBER,
    TYPE_STRING,
    TYPE_DATE,
} from '../constants/dataTable.js'
import {
    EVENT_LAYER,
    THEMATIC_LAYER,
    ORG_UNIT_LAYER,
    EARTH_ENGINE_LAYER,
    FACILITY_LAYER,
    GEOJSON_URL_LAYER,
    TRACKED_ENTITY_LAYER,
} from '../constants/layers.js'
import { numberValueTypes } from '../constants/valueTypes.js'
import { hasClasses } from './earthEngine.js'
import { getGeojsonDisplayData } from './geojson.js'
import { getRoundToPrecisionFn, getPrecision } from './numbers.js'
import { isValidUid } from './uid.js'

export { TYPE_NUMBER, TYPE_STRING, TYPE_DATE }

const NAME = 'name'
const ID = 'id'
const VALUE = 'rawValue'
const LEGEND = 'legend'
const RANGE = 'range'
const LEVEL = 'level'
const PARENT_NAME = 'parentName'
const TYPE = 'type'
const COLOR = 'color'
const GROUP = 'group'
const ICON = 'iconUrl'
const OUNAME = 'ouname'
const OUBOUNDARY = 'ouBoundary'
const EVENTDATE = 'eventdate'

export const ERROR_NON_HOMOGENOUS_FEATURES = 'NON_HOMOGENOUS_FEATURES'

const defaultFieldsMap = () => ({
    [NAME]: { name: i18n.t('Name'), dataKey: NAME, type: TYPE_STRING },
    [ID]: { name: i18n.t('Id'), dataKey: ID, type: TYPE_STRING },
    [LEVEL]: { name: i18n.t('Level'), dataKey: LEVEL, type: TYPE_NUMBER },
    [PARENT_NAME]: {
        name: i18n.t('Parent'),
        dataKey: PARENT_NAME,
        type: TYPE_STRING,
    },
    [TYPE]: { name: i18n.t('Type'), dataKey: TYPE, type: TYPE_STRING },
    [VALUE]: { name: i18n.t('Value'), dataKey: VALUE, type: TYPE_NUMBER },
    [LEGEND]: { name: i18n.t('Legend'), dataKey: LEGEND, type: TYPE_STRING },
    [RANGE]: { name: i18n.t('Range'), dataKey: RANGE, type: TYPE_STRING },
    [OUNAME]: { name: i18n.t('Org unit'), dataKey: OUNAME, type: TYPE_STRING },
    [OUBOUNDARY]: {
        name: i18n.t('Org unit boundary'),
        dataKey: OUBOUNDARY,
        type: TYPE_STRING,
    },
    [EVENTDATE]: {
        name: i18n.t('Event time'),
        dataKey: EVENTDATE,
        type: TYPE_DATE,
        renderer: RENDERER_DATE,
    },
    [COLOR]: {
        name: i18n.t('Color'),
        dataKey: COLOR,
        type: TYPE_STRING,
        renderer: RENDERER_COLOR,
    },
    [GROUP]: { name: i18n.t('Group'), dataKey: GROUP, type: TYPE_STRING },
    [ICON]: {
        name: i18n.t('Icon'),
        dataKey: ICON,
        type: TYPE_STRING,
        renderer: RENDERER_ICON,
    },
})

const getStyleHeaders = ({
    hasLegend,
    hasRange,
    hasGroup,
    hasColor,
    hasIcon,
}) => {
    const headers = []
    if (hasLegend) {
        headers.push(defaultFieldsMap()[LEGEND])
    }
    if (hasRange) {
        headers.push(defaultFieldsMap()[RANGE])
    }
    if (hasGroup) {
        headers.push(defaultFieldsMap()[GROUP])
    }
    if (hasColor) {
        headers.push(defaultFieldsMap()[COLOR])
    }
    if (hasIcon) {
        headers.push(defaultFieldsMap()[ICON])
    }
    return headers
}

const getThematicHeaders = () =>
    [NAME, ID, VALUE, LEVEL, PARENT_NAME, TYPE]
        .map((field) => defaultFieldsMap()[field])
        .concat(
            getStyleHeaders({ hasLegend: true, hasRange: true, hasColor: true })
        )

const getMultiPeriodThematicHeaders = ({
    isTimelineThematic,
    externalPeriod,
    periods,
}) => {
    const headers = isTimelineThematic
        ? getThematicHeaders().map((header) =>
              [VALUE, LEGEND, RANGE, COLOR].includes(header.dataKey)
                  ? {
                        ...header,
                        name: `${header.name} (${
                            externalPeriod?.name ?? i18n.t('Current period')
                        })`,
                    }
                  : header
          )
        : getOrgUnitHeaders()

    const otherPeriods = isTimelineThematic
        ? (periods ?? []).filter((p) => p.id !== externalPeriod?.id)
        : periods ?? []

    otherPeriods.forEach((period) => {
        headers.push({
            name: i18n.t('Value ({{period}})', { period: period.name }),
            dataKey: `period_${period.id}_rawValue`,
            type: TYPE_NUMBER,
            defaultHidden: true,
        })
    })

    return headers
}

const getEventHeaders = ({
    layerHeaders = [],
    styleDataItem,
    countEventsOutsideOrgUnits,
}) => {
    const fields = [OUNAME, ID, EVENTDATE].map(
        (field) => defaultFieldsMap()[field]
    )

    if (countEventsOutsideOrgUnits) {
        fields.push(defaultFieldsMap()[OUBOUNDARY])
    }

    const customFields = layerHeaders
        .filter(({ name }) => isValidUid(name))
        .map(({ name: dataKey, column: name, valueType, optionSet }) => ({
            name,
            dataKey,
            type:
                !optionSet && numberValueTypes.includes(valueType)
                    ? TYPE_NUMBER
                    : TYPE_STRING,
            optionSet: optionSet || null,
        }))

    customFields.push(
        defaultFieldsMap()[TYPE],
        ...getStyleHeaders({
            hasLegend: !!styleDataItem,
            hasRange: !!styleDataItem,
            hasColor: !!styleDataItem,
        })
    )

    return fields.concat(customFields)
}

const getOrgUnitStyleHeaders = (data) => {
    let hasGroup = false
    let hasColor = false
    let hasIcon = false

    for (const d of data ?? []) {
        hasGroup ||= d.group != null
        hasColor ||= d.color != null
        hasIcon ||= d.iconUrl != null

        if (hasGroup && hasColor && hasIcon) {
            break
        }
    }

    return getStyleHeaders({ hasGroup, hasColor, hasIcon })
}

// Org unit and facility headers share the same shape
const getFixedFieldsWithOrgUnitStyle = (fields, data) =>
    fields
        .map((field) => defaultFieldsMap()[field])
        .concat(getOrgUnitStyleHeaders(data))

const getOrgUnitHeaders = (data) =>
    getFixedFieldsWithOrgUnitStyle([NAME, ID, LEVEL, PARENT_NAME, TYPE], data)

const getTrackedEntityHeaders = ({ layerHeaders = [] }) => {
    const fields = [ID].map((field) => defaultFieldsMap()[field])

    const customFields = layerHeaders
        .filter(({ dataKey }) => isValidUid(dataKey))
        .map(({ name, dataKey, valueType }) => ({
            name,
            dataKey,
            type: numberValueTypes.includes(valueType)
                ? TYPE_NUMBER
                : TYPE_STRING,
        }))

    customFields.push(...getStyleHeaders({ hasColor: true }))

    return fields.concat(customFields)
}

const getFacilityHeaders = (data) =>
    getFixedFieldsWithOrgUnitStyle([NAME, ID, TYPE], data)

const toTitleCase = (str) =>
    str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )

const getEarthEngineHeaders = ({ aggregationType, legend, data }) => {
    const { title, items } = legend

    let customFields = []

    if (hasClasses(aggregationType) && items) {
        customFields = items.map(({ value, name }) => ({
            name,
            dataKey: String(value),
            roundFn: getRoundToPrecisionFn(2),
            type: TYPE_NUMBER,
        }))
    } else if (Array.isArray(aggregationType) && aggregationType.length) {
        customFields = aggregationType.map((type) => {
            let roundFn = null
            if (data?.length) {
                const precision = getPrecision(data.map((d) => d[type]))
                roundFn = getRoundToPrecisionFn(precision)
            }
            return {
                name: toTitleCase(`${type} ${title}`),
                dataKey: type,
                roundFn,
                type: TYPE_NUMBER,
            }
        })
    }

    return [NAME, ID, TYPE]
        .map((field) => defaultFieldsMap()[field])
        .concat(customFields)
}

const getGeoJsonUrlHeaders = (firstDataItem) =>
    getGeojsonDisplayData(firstDataItem).map((header) =>
        header.dataKey === COLOR ? defaultFieldsMap()[COLOR] : header
    )

export const getHeadersForLayer = (layerType, ctx) => {
    switch (layerType) {
        case THEMATIC_LAYER:
            return {
                headers: ctx.isMultiPeriodThematic
                    ? getMultiPeriodThematicHeaders({
                          isTimelineThematic: ctx.isTimelineThematic,
                          externalPeriod: ctx.externalPeriod,
                          periods: ctx.periods,
                      })
                    : getThematicHeaders(),
            }
        case EVENT_LAYER:
            return {
                headers: getEventHeaders({
                    layerHeaders: ctx.layerHeaders,
                    styleDataItem: ctx.styleDataItem,
                    countEventsOutsideOrgUnits: ctx.countEventsOutsideOrgUnits,
                }),
            }
        case ORG_UNIT_LAYER:
            return { headers: getOrgUnitHeaders(ctx.data) }
        case TRACKED_ENTITY_LAYER:
            return {
                headers: getTrackedEntityHeaders({
                    layerHeaders: ctx.layerHeaders,
                }),
            }
        case EARTH_ENGINE_LAYER:
            return {
                headers: getEarthEngineHeaders({
                    aggregationType: ctx.aggregationType,
                    legend: ctx.legend,
                    data: ctx.data,
                }),
            }
        case FACILITY_LAYER:
            return { headers: getFacilityHeaders(ctx.data) }
        case GEOJSON_URL_LAYER: {
            // Unlike the other cases, this reads the raw layer data
            // rather than dataWithAggregations
            const rawData = ctx.rawData ?? []
            const nonMultiType = (type) => type.replaceAll('Multi', '')
            const isHomogenous = rawData.every(
                (feature) =>
                    nonMultiType(feature.geometry.type) ===
                    nonMultiType(rawData[0]?.geometry.type ?? '')
            )
            if (!isHomogenous) {
                return { errorCode: ERROR_NON_HOMOGENOUS_FEATURES }
            }
            return { headers: getGeoJsonUrlHeaders(rawData[0]) }
        }
        default:
            return { headers: null }
    }
}
