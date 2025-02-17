import * as types from '../constants/actionTypes.js'

// Add dimension filter
export const addDimensionFilter = (filter) => ({
    type: types.LAYER_EDIT_DIMENSION_FILTER_ADD,
    filter,
})

// Remove dimension filter
export const removeDimensionFilter = (index) => ({
    type: types.LAYER_EDIT_DIMENSION_FILTER_REMOVE,
    index,
})

// Chenge a dimension filter in an array
export const changeDimensionFilter = (index, filter) => ({
    type: types.LAYER_EDIT_DIMENSION_FILTER_CHANGE,
    index,
    filter,
})

// Add event filter
export const addFilter = (filter) => ({
    type: types.LAYER_EDIT_FILTER_ADD,
    filter,
})

// Remove event filter
export const removeFilter = (index) => ({
    type: types.LAYER_EDIT_FILTER_REMOVE,
    index,
})

// Change event filter
export const changeFilter = (index, filter) => ({
    type: types.LAYER_EDIT_FILTER_CHANGE,
    index,
    filter,
})

// Set program used (event and thematic)
export const setProgram = (program) => ({
    type: types.LAYER_EDIT_PROGRAM_SET,
    program,
})

// Set program stage used (event)
export const setProgramStage = (programStage) => ({
    type: types.LAYER_EDIT_PROGRAM_STAGE_SET,
    programStage,
})

// Set data item (thematic)
export const setDataItem = (dataItem, dimension) => ({
    type: types.LAYER_EDIT_DATA_ITEM_SET,
    dataItem,
    dimension,
})

// Set program indicator used (thematic)
export const setDataElementGroup = (dataElementGroup) => ({
    type: types.LAYER_EDIT_DATA_ELEMENT_GROUP_SET,
    dataElementGroup,
})

// Set data element operand (operand = true = details, operand = false = totals)
export const setOperand = (operand) => ({
    type: types.LAYER_EDIT_OPERAND_SET,
    operand,
})

// Set data element used for styling (event)
export const setStyleDataItem = (dataItem) => ({
    type: types.LAYER_EDIT_STYLE_DATA_ITEM_SET,
    dataItem,
})

// Set options for style data element with option set (options are loaded separately) (event layer)
export const setOptionStyle = (options) => ({
    type: types.LAYER_EDIT_STYLE_DATA_ITEM_OPTIONS_SET,
    options,
})

export const setBooleanStyle = (value, color) => ({
    type: types.LAYER_EDIT_STYLE_DATA_ITEM_BOOLEAN_SET,
    value,
    color,
})

// Set thematic map type (choropleth, bubble map)
export const setThematicMapType = (type) => ({
    type: types.LAYER_EDIT_THEMATIC_MAP_TYPE_SET,
    payload: type,
})

// Set classification style (method, classes, colorScale)
export const setClassification = (method) => ({
    type: types.LAYER_EDIT_CLASSIFICATION_SET,
    method,
})

export const setColorScale = (colorScale) => ({
    type: types.LAYER_EDIT_COLOR_SCALE_SET,
    colorScale,
})

// Set event status
export const setEventStatus = (status) => ({
    type: types.LAYER_EDIT_EVENT_STATUS_SET,
    status,
})

// Set coordinate field
export const setEventCoordinateField = (fieldId) => ({
    type: types.LAYER_EDIT_EVENT_COORDINATE_FIELD_SET,
    fieldId,
})

// Set fallback coordinate field
export const setFallbackCoordinateField = (fieldId) => ({
    type: types.LAYER_EDIT_FALLBACK_COORDINATE_FIELD_SET,
    fieldId,
})

// Set if event heatmap should be used (event)
export const setEventHeatmap = (checked) => ({
    type: types.LAYER_EDIT_EVENT_HEATMAP_SET,
    checked,
})

// Set if event clustering should be used (event)
export const setEventClustering = (checked) => ({
    type: types.LAYER_EDIT_EVENT_CLUSTERING_SET,
    checked,
})

// Set event point radius (event layer)
export const setEventPointRadius = (radius) => ({
    type: types.LAYER_EDIT_EVENT_POINT_RADIUS_SET,
    radius,
})

// Set event point color (event layer)
export const setEventPointColor = (color) => ({
    type: types.LAYER_EDIT_EVENT_POINT_COLOR_SET,
    color,
})

export const setRelatedPointColor = (color) => ({
    type: types.LAYER_EDIT_RELATED_POINT_COLOR_SET,
    color,
})

export const setRelatedPointRadius = (radius) => ({
    type: types.LAYER_EDIT_RELATED_POINT_RADIUS_SET,
    radius,
})

export const setRelationshipLineColor = (color) => ({
    type: types.LAYER_EDIT_RELATIONSHIP_LINE_COLOR_SET,
    color,
})

// Set organisation unit group set (facility and org unit layer)
export const setOrganisationUnitGroupSet = (organisationUnitGroupSet) => ({
    type: types.LAYER_EDIT_ORGANISATION_UNIT_GROUP_SET,
    organisationUnitGroupSet,
})

// Set organisation unit color (org unit and facility layer)
export const setOrganisationUnitColor = (color) => ({
    type: types.LAYER_EDIT_ORGANISATION_UNIT_COLOR_SET,
    color,
})

export const setOrganisationUnitField = (payload) => ({
    type: types.LAYER_EDIT_ORGANISATION_UNIT_FIELD_SET,
    payload,
})

// Set period label (earth engine)
export const setPeriodName = (periodName) => ({
    type: types.LAYER_EDIT_PERIOD_NAME_SET,
    periodName,
})

// Set period type (thematic)
export const setPeriodType = (periodType, keepPeriod) => ({
    type: types.LAYER_EDIT_PERIOD_TYPE_SET,
    periodType,
    keepPeriod,
})

// Set periods (thematic)
export const setPeriods = (periods) => ({
    type: types.LAYER_EDIT_PERIODS_SET,
    periods,
})

// Set period (event & thematic)
export const setPeriod = (period) => ({
    type: types.LAYER_EDIT_PERIOD_SET,
    period,
})

// Set start date (event)
export const setStartDate = (startDate) => ({
    type: types.LAYER_EDIT_START_DATE_SET,
    startDate,
})

// Set end date (event)
export const setEndDate = (endDate) => ({
    type: types.LAYER_EDIT_END_DATE_SET,
    endDate,
})

// Set periods or dates backup
export const setBackupPeriodsDates = (backupPeriodsDates) => ({
    type: types.LAYER_EDIT_BACKUP_PERIODSDATES_SET,
    backupPeriodsDates,
})

// Set value type (thematic)
export const setValueType = (valueType, keepColumns) => ({
    type: types.LAYER_EDIT_VALUE_TYPE_SET,
    valueType,
    keepColumns, // Kept if favorite is loaded
})

// Set indicator group (thematic)
export const setIndicatorGroup = (indicatorGroup) => ({
    type: types.LAYER_EDIT_INDICATOR_GROUP_SET,
    indicatorGroup,
})

// Set aggregation type (thematic/earth engine)
export const setAggregationType = (aggregationType) => ({
    type: types.LAYER_EDIT_AGGREGATION_TYPE_SET,
    aggregationType,
})

// Set organisation units
export const setOrgUnits = (payload) => ({
    type: types.LAYER_EDIT_ORGANISATION_UNITS_SET,
    payload,
})

// Set org. unit mode
export const setOrgUnitMode = (mode) => ({
    type: types.LAYER_EDIT_ORGANISATION_UNIT_MODE_SET,
    payload: mode,
})

// Set layer style (EE)
export const setStyle = (payload) => ({
    type: types.LAYER_EDIT_STYLE_SET,
    payload,
})

// Set collection filter (EE)
export const setFilter = (filter) => ({
    type: types.LAYER_EDIT_FILTER_SET,
    filter,
})

// Set band (EE)
export const setBand = (band) => ({
    type: types.LAYER_EDIT_BAND_SET,
    payload: band,
})

// Set label visibility
export const setLabels = (isChecked) => ({
    type: types.LAYER_EDIT_LABELS_SET,
    isChecked,
})

export const setLabelTemplate = (template) => ({
    type: types.LAYER_EDIT_LABEL_TEMPLATE,
    template,
})

// Set label font style (italic)
export const setLabelFontSize = (size) => ({
    type: types.LAYER_EDIT_LABEL_FONT_SIZE_SET,
    size,
})

// Set label font weight (bold)
export const setLabelFontWeight = (weight) => ({
    type: types.LAYER_EDIT_LABEL_FONT_WEIGHT_SET,
    weight,
})

// Set label font style
export const setLabelFontStyle = (style) => ({
    type: types.LAYER_EDIT_LABEL_FONT_STYLE_SET,
    style,
})

// Set label font color
export const setLabelFontColor = (color) => ({
    type: types.LAYER_EDIT_LABEL_FONT_COLOR_SET,
    color,
})

// Set area radius (facility)
export const setBufferRadius = (radius) => ({
    type: types.LAYER_EDIT_BUFFER_RADIUS_SET,
    radius,
})

// Set point radius low (thematic, org unit)
export const setRadiusLow = (radius) => ({
    type: types.LAYER_EDIT_RADIUS_LOW_SET,
    radius,
})

// Set point radius high (thematic)
export const setRadiusHigh = (radius) => ({
    type: types.LAYER_EDIT_RADIUS_HIGH_SET,
    radius,
})

// Set legend set (event, thematic)
export const setLegendSet = (legendSet) => ({
    type: types.LAYER_EDIT_LEGEND_SET_SET,
    legendSet,
})

// Load organisation unit tree path (temporary solution, as favorites don't include paths)
export const setOrgUnitPath = (id, path) => ({
    type: types.LAYER_EDIT_ORGANISATION_UNIT_PATH_SET,
    id,
    path,
})

// Set the tracked entity type
export const setTrackedEntityType = (trackedEntityType) => ({
    type: types.LAYER_EDIT_TRACKED_ENTITY_TYPE_SET,
    trackedEntityType,
})

// Set the type of tracked entity relationship to render
export const setTrackedEntityRelationshipType = (relationshipType) => ({
    type: types.LAYER_EDIT_TRACKED_ENTITY_RELATIONSHIP_TYPE_SET,
    relationshipType,
})

export const setTrackedEntityRelationshipOutsideProgram = (checked) => ({
    type: types.LAYER_EDIT_TRACKED_ENTITY_RELATIONSHIP_OUTSIDE_PROGRAM_SET,
    payload: checked,
})

// Set program status for a TEI
export const setProgramStatus = (status) => ({
    type: types.LAYER_EDIT_PROGRAM_STATUS_SET,
    payload: status,
})

// Set follow up status of a TEI for a given program
export const setFollowUpStatus = (checked) => ({
    type: types.LAYER_EDIT_FOLLOW_UP_SET,
    payload: checked,
})

// Set display mode for periods
export const setRenderingStrategy = (display) => ({
    type: types.LAYER_EDIT_RENDERING_STRATEGY_SET,
    payload: display,
})

// Set no data color
export const setNoDataColor = (color) => ({
    type: types.LAYER_EDIT_NO_DATA_COLOR_SET,
    payload: color,
})

// Set period for EE layer
export const setEarthEnginePeriod = (payload) => ({
    type: types.LAYER_EDIT_EARTH_ENGINE_PERIOD_SET,
    payload,
})

// Set feature style
export const setFeatureStyle = (payload) => ({
    type: types.LAYER_EDIT_FEATURE_STYLE_SET,
    payload,
})
