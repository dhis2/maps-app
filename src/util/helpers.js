import i18n from '@dhis2/d2-i18n'
import { isObject } from 'lodash/fp'
import { RENDERING_STRATEGY_SPLIT_BY_PERIOD } from '../constants/layers.js'
import {
    booleanValueTypes,
    dateValueTypes,
    datetimeValueTypes,
    coordinateValueTypes,
    ouValueTypes,
} from '../constants/valueTypes.js'

const getBaseFields = (withSubscribers) => {
    const baseFields = [
        'id',
        'user',
        'name',
        'displayName',
        'description',
        'displayDescription',
        'longitude',
        'latitude',
        'zoom',
        'basemap',
        'created',
        'lastUpdated',
        'access',
        'update',
        'manage',
        'delete',
        'href',
    ]
    if (withSubscribers) {
        baseFields.push('subscribers')
    }
    return baseFields
}

const analysisFields = () => {
    const nameProperty = `displayName~rename(name)`
    return [
        '*',
        `columns[dimension,filter,items[dimensionItem~rename(id),dimensionItemType,${nameProperty}]]`,
        `rows[dimension,filter,items[dimensionItem~rename(id),dimensionItemType,${nameProperty}]]`,
        `filters[dimension,filter,items[dimensionItem~rename(id),dimensionItemType,${nameProperty}]]`,
        'organisationUnits[id,path]', // Added to retrieve org unit paths
        'dataDimensionItems',
        `program[id,${nameProperty}]`,
        'programStage[id,displayName~rename(name)]',
        'legendSet[id,displayName~rename(name)]',
        'trackedEntityType[id,displayName~rename(name)]',
        'organisationUnitSelectionMode',
        '!href',
        '!publicAccess',
        '!rewindRelativePeriods',
        '!userOrganisationUnit',
        '!userOrganisationUnitChildren',
        '!userOrganisationUnitGrandChildren',
        '!externalAccess',
        '!access',
        '!relativePeriods',
        '!columnDimensions',
        '!rowDimensions',
        '!filterDimensions',
        '!user',
        '!organisationUnitGroups',
        '!itemOrganisationUnitGroups',
        '!userGroupAccesses',
        '!indicators',
        '!dataElements',
        '!dataElementOperands',
        '!dataElementGroups',
        '!dataSets',
        '!periods',
        '!organisationUnitLevels',
        '!sortOrder',
        '!topLimit',
    ]
}

export const mapFields = (withSubscribers = false) => {
    const fields = analysisFields()

    return `${getBaseFields(withSubscribers).join(',')}, mapViews[${fields.join(
        ','
    )}]`
}

// Add path to org unit dimension  - https://jira.dhis2.org/browse/DHIS2-4212
export const addOrgUnitPaths = (mapViews) =>
    mapViews.map((view) =>
        view.rows && view.organisationUnits
            ? {
                  ...view,
                  rows: view.rows.map((dim) => ({
                      ...dim,
                      items: dim.items.map((orgUnit) => ({
                          ...orgUnit,
                          path: (
                              view.organisationUnits.find(
                                  (ou) => ou.id === orgUnit.id
                              ) || {}
                          ).path,
                      })),
                  })),
              }
            : view
    )

const mandatoryDataItemAttributes = ['id', 'name', 'valueType']

// Checks if a data item is valid (program stage data elements and tracked entity attributes)
export const getValidDataItems = (items) =>
    items.filter(
        (item) =>
            isObject(item) &&
            mandatoryDataItemAttributes.every((prop) => prop in item)
    )

// Returns split view layers if exist
export const getSplitViewLayers = (layers) =>
    layers?.filter(
        (layer) =>
            layer.renderingStrategy === RENDERING_STRATEGY_SPLIT_BY_PERIOD
    ) || []
export const getSplitViewLayer = (layers) => getSplitViewLayers(layers)[0]

// Checks if split view map
export const isSplitViewMap = (layers) => getSplitViewLayers(layers).length > 0

// Get the longest text length from an object property in an array
export const getLongestTextLength = (array, key) =>
    array.reduce(
        (text, curr) =>
            curr[key] && String(curr[key]).length > text.length
                ? String(curr[key])
                : text,
        ''
    ).length

// Formats a DHIS2 coordinate value
export const formatCoordinate = (value) => {
    try {
        const array = Array.isArray(value) ? value : JSON.parse(value)
        if (
            Array.isArray(array) &&
            array.length === 2 &&
            array.every((v) => !isNaN(Number(v)))
        ) {
            return array.map((v) => Number(v).toFixed(6)).join(', ')
        }
        return value
    } catch (e) {
        return value
    }
}

// Formats a DHIS2 yes/no or yes only value
const formatBoolean = (value) => {
    if (value === 'true') {
        return i18n.t('Yes')
    }
    if (value === 'false') {
        return i18n.t('No')
    }
    return value
}

// Formats a DHIS2 date string value
const formatDate = (value) => {
    const datePattern = /^(\d{4}-\d{2}-\d{2})/
    const match = value.match(datePattern)
    return match ? match[1] : value
}

// Formats a DHIS2 datetime string value
export const formatDatetime = (value) => {
    const datetimePattern = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/
    const match = value.match(datetimePattern)
    return match ? `${match[1]} ${match[2]}` : value
}

// Returns true if value is not undefined, null, empty string, or already marked as 'Not set'
export const hasValue = (value) =>
    value !== undefined &&
    value !== null &&
    value !== '' &&
    value !== i18n.t('Not set')

// Formats value for display
// Ref: https://docs.dhis2.org/en/develop/using-the-api/dhis-core-version-master/metadata.html#metadata-attribute-value-type-and-validations
export const formatValueForDisplay = ({
    value,
    valueType,
    options,
    orgUnitNames,
}) => {
    if (!hasValue(value)) {
        return i18n.t('Not set')
    }
    if (typeof value !== 'string') {
        console.warn(
            `Warning: The value ${JSON.stringify(value)} is not a string`
        )
    }
    if (options && hasValue(options[value])) {
        return options[value]
    }
    if (
        ouValueTypes.includes(valueType) &&
        orgUnitNames &&
        hasValue(orgUnitNames[value])
    ) {
        return orgUnitNames[value]
    }
    if (coordinateValueTypes.includes(valueType)) {
        return formatCoordinate(value)
    }
    if (booleanValueTypes.includes(valueType)) {
        return formatBoolean(value)
    }
    if (dateValueTypes.includes(valueType)) {
        return formatDate(value)
    }
    if (datetimeValueTypes.includes(valueType)) {
        return formatDatetime(value)
    }
    // TODO formatNumeric
    return value
}

// Sum all numbers in an object recursively
export const sumObjectValues = (obj) =>
    Object.values(obj).reduce((sum, value) => {
        if (value === null || value === undefined) {
            return sum
        } else if (typeof value === 'object') {
            return sum + sumObjectValues(value)
        } else if (typeof value === 'number') {
            return sum + value
        }
        return sum
    }, 0)

// Get value given a css var name
export const getCssVar = (cssVar) =>
    Number(
        getComputedStyle(document.documentElement)
            .getPropertyValue(cssVar)
            .replace('px', '')
    )
