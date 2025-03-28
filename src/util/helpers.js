import { isObject } from 'lodash/fp'
import { RENDERING_STRATEGY_SPLIT_BY_PERIOD } from '../constants/layers.js'

const baseFields = [
    'id',
    'user',
    'displayName~rename(name)',
    'description',
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

export const mapFields = () => {
    const fields = analysisFields()
    return `${baseFields.join(',')}, mapViews[${fields.join(',')}]`
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

// Returns split view layer if exist
export const getSplitViewLayer = (layers) =>
    layers.find(
        (layer) =>
            layer.renderingStrategy === RENDERING_STRATEGY_SPLIT_BY_PERIOD
    )

// Checks if split view map
export const isSplitViewMap = (layers) => !!getSplitViewLayer(layers)

export const formatCoordinate = (value) => {
    try {
        return JSON.parse(value)
            .map((v) => v.toFixed(6))
            .join(', ')
    } catch (e) {
        return value
    }
}

// Formats a DHIS2 time string
export const formatTime = (time) =>
    `${time.substring(0, 10)} ${time.substring(11, 16)}`

// Get the longest text length from an object property in an array
export const getLongestTextLength = (array, key) =>
    array.reduce(
        (text, curr) =>
            curr[key] && String(curr[key]).length > text.length
                ? String(curr[key])
                : text,
        ''
    ).length

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
