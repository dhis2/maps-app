// Same fields as the dashboard app's getFavoriteFields and getMapFields
const DIMENSION_FIELDS =
    'dimension,legendSet[id],filter,programStage,items[dimensionItem~rename(id),displayName~rename(name),dimensionItemType],dimensionType,program[id],optionSet[id],valueType'
const AXES_FIELDS = ['columns', 'rows', 'filters']
    .map((axis) => `${axis}[${DIMENSION_FIELDS}]`)
    .join(',')
export const FAVORITE_FIELDS = [
    'id',
    'displayName~rename(name)',
    'type',
    'displayDescription~rename(description)',
    AXES_FIELDS,
    '*',
    '!attributeDimensions',
    '!attributeValues',
    '!category',
    '!categoryDimensions',
    '!categoryOptionGroupSetDimensions',
    '!columnDimensions',
    '!dataDimensionItems',
    '!dataElementDimensions',
    '!dataElementGroupSetDimensions',
    '!filterDimensions',
    '!itemOrganisationUnitGroups',
    '!lastUpdatedBy',
    '!organisationUnitGroupSetDimensions',
    '!organisationUnitLevels',
    '!organisationUnits',
    '!programIndicatorDimensions',
    '!relativePeriods',
    '!reportParams',
    '!rowDimensions',
    '!translations',
    '!userOrganisationUnit',
    '!userOrganisationUnitChildren',
    '!userOrganisationUnitGrandChildren',
].join(',')
const MAP_VIEW_FIELDS = [
    FAVORITE_FIELDS,
    'program[id,displayName~rename(name)]',
    'programStage[id,displayName~rename(name)]',
    'trackedEntityType[id,displayName~rename(name)]',
].join(',')
export const MAP_FIELDS = `id,displayName~rename(name),user,longitude,latitude,zoom,basemap,basemaps,mapViews[${MAP_VIEW_FIELDS}]`

// A map item, loaded as the dashboard app does
export const MAP_QUERY = {
    map: {
        resource: 'maps',
        id: ({ id }) => id,
        params: { fields: MAP_FIELDS },
    },
}

export const SUGGESTIONS_QUERY = {
    maps: {
        resource: 'maps',
        params: {
            fields: 'id,displayName~rename(name)',
            order: 'displayName:asc',
            pageSize: 10,
        },
    },
    // Usually the country and its regions (districts in Sierra Leone)
    orgUnits: {
        resource: 'organisationUnits',
        params: {
            fields: 'id,displayName~rename(name)',
            filter: 'level:le:2',
            order: 'level:asc,displayName:asc',
            paging: false,
        },
    },
}
