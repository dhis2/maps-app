import i18n from '@dhis2/d2-i18n'
import {
    RENDERER_COLOR,
    RENDERER_ICON,
    RENDERER_DATE,
    RENDERER_ORG_UNIT,
    RENDERER_ORG_UNIT_NAME,
    RENDERER_BOOLEAN,
    TYPE_NUMBER,
    TYPE_STRING,
    TYPE_DATE,
    TYPE_DATETIME,
    TYPE_TIME,
    TYPE_ORG_UNIT,
    ORG_UNIT_PATH_DATA_KEY,
    ORG_UNIT_DATA_KEY,
    ORG_UNIT_ID_DATA_KEY,
    ORG_UNIT_LEVEL_DATA_KEY,
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
import {
    numberValueTypes,
    dateValueTypes,
    datetimeValueTypes,
    timeValueTypes,
    ouValueTypes,
    booleanValueTypes,
} from '../constants/valueTypes.js'
import { hasClasses } from './earthEngine.js'
import { getGeojsonDisplayData } from './geojson.js'
import { getRoundToPrecisionFn, getPrecision } from './numbers.js'
import { isValidUid } from './uid.js'

export { TYPE_NUMBER, TYPE_STRING, TYPE_DATE, TYPE_DATETIME, TYPE_TIME }

const getCustomFieldType = (valueType, hasOptionSet) => {
    if (hasOptionSet) {
        return TYPE_STRING
    }
    if (numberValueTypes.includes(valueType)) {
        return TYPE_NUMBER
    }
    if (dateValueTypes.includes(valueType)) {
        return TYPE_DATE
    }
    if (datetimeValueTypes.includes(valueType)) {
        return TYPE_DATETIME
    }
    if (timeValueTypes.includes(valueType)) {
        return TYPE_TIME
    }
    return TYPE_STRING
}

const DATE_LIKE_TYPES = new Set([TYPE_DATE, TYPE_DATETIME, TYPE_TIME])

const getCustomFieldRenderer = (type, valueType) => {
    if (DATE_LIKE_TYPES.has(type)) {
        return RENDERER_DATE
    }
    if (ouValueTypes.includes(valueType)) {
        return RENDERER_ORG_UNIT
    }
    if (booleanValueTypes.includes(valueType)) {
        return RENDERER_BOOLEAN
    }
    return undefined
}

const ID = 'id'
const VALUE = 'rawValue'
const LEGEND = 'legend'
const RANGE = 'range'
const LEVEL = ORG_UNIT_LEVEL_DATA_KEY
const TYPE = 'type'
const COLOR = 'color'
const GROUP = 'group'
const ICON = 'iconUrl'
const OUBOUNDARY = 'ouBoundary'
const EVENTDATE = 'eventdate'
const LASTUPDATED = 'lastupdated'
const CREATEDAT = 'createdAt'
const UPDATEDAT = 'updatedAt'
const ORG_UNIT_PATH = ORG_UNIT_PATH_DATA_KEY
const ORG_UNIT = ORG_UNIT_DATA_KEY
const ORG_UNIT_ID = ORG_UNIT_ID_DATA_KEY

export const ERROR_NON_HOMOGENOUS_FEATURES = 'NON_HOMOGENOUS_FEATURES'

const defaultFieldsMap = () => ({
    [ID]: {
        name: i18n.t('Id'),
        dataKey: ID,
        type: TYPE_STRING,
        defaultHidden: true,
    },
    [ORG_UNIT_ID]: {
        name: i18n.t('Org unit id'),
        dataKey: ORG_UNIT_ID,
        type: TYPE_STRING,
        defaultHidden: true,
    },
    [ORG_UNIT]: {
        name: i18n.t('Org unit'),
        dataKey: ORG_UNIT,
        type: TYPE_STRING,
        renderer: RENDERER_ORG_UNIT_NAME,
    },
    [LEVEL]: {
        name: i18n.t('Org unit level'),
        dataKey: LEVEL,
        type: TYPE_NUMBER,
        defaultHidden: true,
    },
    [TYPE]: {
        name: i18n.t('Geometry type'),
        dataKey: TYPE,
        type: TYPE_STRING,
        defaultHidden: true,
    },
    [VALUE]: { name: i18n.t('Value'), dataKey: VALUE, type: TYPE_NUMBER },
    [LEGEND]: { name: i18n.t('Legend'), dataKey: LEGEND, type: TYPE_STRING },
    [RANGE]: { name: i18n.t('Range'), dataKey: RANGE, type: TYPE_STRING },
    [OUBOUNDARY]: {
        name: i18n.t('Org unit boundary'),
        dataKey: OUBOUNDARY,
        type: TYPE_STRING,
    },
    [ORG_UNIT_PATH]: {
        name: i18n.t('Org unit hierarchy'),
        dataKey: ORG_UNIT_PATH,
        type: TYPE_ORG_UNIT,
        renderer: RENDERER_ORG_UNIT,
    },
    [EVENTDATE]: {
        name: i18n.t('Event date'),
        dataKey: EVENTDATE,
        type: TYPE_DATE,
        renderer: RENDERER_DATE,
    },
    [LASTUPDATED]: {
        name: i18n.t('Last updated'),
        dataKey: LASTUPDATED,
        type: TYPE_DATETIME,
        renderer: RENDERER_DATE,
    },
    [CREATEDAT]: {
        name: i18n.t('Created'),
        dataKey: CREATEDAT,
        type: TYPE_DATETIME,
        renderer: RENDERER_DATE,
    },
    [UPDATEDAT]: {
        name: i18n.t('Last updated'),
        dataKey: UPDATEDAT,
        type: TYPE_DATETIME,
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

const idFieldAs = (name) => ({ ...defaultFieldsMap()[ID], name })

const getOrgUnitCoreFields = (idLabel, { includeOrgUnitId = false } = {}) => [
    idFieldAs(idLabel),
    ...(includeOrgUnitId ? [defaultFieldsMap()[ORG_UNIT_ID]] : []),
    defaultFieldsMap()[ORG_UNIT],
    defaultFieldsMap()[LEVEL],
    defaultFieldsMap()[ORG_UNIT_PATH],
]

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
    getOrgUnitCoreFields(i18n.t('Org unit id'))
        .concat(defaultFieldsMap()[VALUE])
        .concat(
            getStyleHeaders({ hasLegend: true, hasRange: true, hasColor: true })
        )
        .concat(defaultFieldsMap()[TYPE])

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
                        configName: `${header.name} (${i18n.t(
                            'Current period'
                        )})`,
                    }
                  : header
          )
        : getOrgUnitHeaders()

    ;(periods ?? []).forEach((period) => {
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
    const fields = getOrgUnitCoreFields(i18n.t('Event Id'), {
        includeOrgUnitId: true,
    })
        .concat(defaultFieldsMap()[EVENTDATE])
        .concat(defaultFieldsMap()[LASTUPDATED])

    if (countEventsOutsideOrgUnits) {
        fields.push(defaultFieldsMap()[OUBOUNDARY])
    }

    // A handful of the analytics response's own fixed column names
    // (e.g. "lastupdated", "eventstatus") happen to be 11 letters
    const fixedDataKeys = new Set(fields.map((f) => f.dataKey))

    const customFields = layerHeaders
        .filter(({ name }) => isValidUid(name) && !fixedDataKeys.has(name))
        .map(({ name: dataKey, column: name, valueType, optionSet }) => {
            const type = getCustomFieldType(valueType, !!optionSet)
            return {
                name,
                dataKey,
                type,
                renderer: getCustomFieldRenderer(type, valueType),
                optionSet: optionSet || null,
            }
        })

    customFields.push(
        ...getStyleHeaders({
            hasLegend: !!styleDataItem,
            hasRange: !!styleDataItem,
            hasColor: !!styleDataItem,
        })
    )

    return fields.concat(customFields).concat(defaultFieldsMap()[TYPE])
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

const getFixedFieldsWithOrgUnitStyle = (data) =>
    getOrgUnitCoreFields(i18n.t('Org unit id'))
        .concat(getOrgUnitStyleHeaders(data))
        .concat(defaultFieldsMap()[TYPE])

const getOrgUnitHeaders = (data) => getFixedFieldsWithOrgUnitStyle(data)

const getTrackedEntityHeaders = ({ layerHeaders = [] }) => {
    const fields = getOrgUnitCoreFields(i18n.t('Tracked entity Id'), {
        includeOrgUnitId: true,
    })
        .concat(defaultFieldsMap()[CREATEDAT])
        .concat(defaultFieldsMap()[UPDATEDAT])

    const customFields = layerHeaders
        .filter(({ dataKey }) => isValidUid(dataKey))
        .map(({ name, dataKey, valueType, optionSet }) => {
            const type = getCustomFieldType(valueType, !!optionSet)
            return {
                name,
                dataKey,
                type,
                renderer: getCustomFieldRenderer(type, valueType),
                optionSet: optionSet || null,
            }
        })

    customFields.push(...getStyleHeaders({ hasColor: true }))

    return fields.concat(customFields).concat(defaultFieldsMap()[TYPE])
}

const getFacilityHeaders = (data) => getFixedFieldsWithOrgUnitStyle(data)

const toTitleCase = (str) =>
    str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )

const getFieldRoundFn = (data, dataKey) => {
    if (!data?.length) {
        return null
    }
    return getRoundToPrecisionFn(getPrecision(data.map((d) => d[dataKey])))
}

const getBandFields = ({ bands, band, aggregationType, data }) => {
    if (!bands?.multiple || !Array.isArray(band) || band.length < 2) {
        return []
    }
    const selectedBands = bands.list?.filter((b) => band.includes(b.id)) ?? []
    return selectedBands.flatMap(({ id: bandId, name: bandName }) =>
        aggregationType.length === 1
            ? [
                  {
                      name: bandName,
                      dataKey: bandId,
                      roundFn: getFieldRoundFn(data, bandId),
                      type: TYPE_NUMBER,
                      defaultHidden: true,
                  },
              ]
            : aggregationType.map((type) => {
                  const dataKey = `${bandId}_${type}`
                  return {
                      name: toTitleCase(`${type} ${bandName}`),
                      dataKey,
                      roundFn: getFieldRoundFn(data, dataKey),
                      type: TYPE_NUMBER,
                      defaultHidden: true,
                  }
              })
    )
}

const getEarthEngineHeaders = ({
    aggregationType,
    legend,
    data,
    bands,
    band,
}) => {
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
        customFields = aggregationType
            .map((type) => {
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
            .concat(getBandFields({ bands, band, aggregationType, data }))
    }

    return getOrgUnitCoreFields(i18n.t('Org unit id'))
        .concat(customFields)
        .concat(defaultFieldsMap()[TYPE])
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
                    bands: ctx.bands,
                    band: ctx.band,
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
