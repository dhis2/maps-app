import * as types from '../constants/actionTypes.js'
import { EVENT_STATUS_ALL } from '../constants/eventStatuses.js'
import {
    CLASSIFICATION_SINGLE_COLOR,
    CLASSIFICATION_EQUAL_INTERVALS,
    CLASSIFICATION_EQUAL_COUNTS,
    CLASSIFICATION_PREDEFINED,
    THEMATIC_CHOROPLETH,
    EE_BUFFER,
    NONE,
} from '../constants/layers.js'
import { START_END_DATES } from '../constants/periods.js'
import {
    setFiltersFromPeriod,
    setFiltersFromPeriods,
    setDataItemInColumns,
    setOrgUnitPathInRows,
    removePeriodFromFilters,
    changeDimensionInFilters,
    removeDimensionFromFilters,
} from '../util/analytics.js'

const layerEdit = (state = null, action) => {
    let columns
    let newState
    let program

    switch (action.type) {
        case types.LAYER_EDIT:
            delete action.payload.img
            return action.payload

        case types.LAYER_CANCEL:
            return null

        case types.LAYER_EDIT_PROGRAM_SET:
            program = action.program

            return {
                ...state,
                program: program ? { ...program } : null,
                columns: [],
                programStage: null,
                styleDataItem: null,
            }

        case types.LAYER_EDIT_PROGRAM_STAGE_SET:
            return {
                ...state,
                programStage: {
                    ...action.programStage,
                },
                columns: [],
                styleDataItem: null,
            }

        case types.LAYER_EDIT_VALUE_TYPE_SET:
            return {
                ...state,
                valueType: action.valueType,
                columns: action.keepColumns ? state.columns : [], // Kept if favorite is loaded
            }

        case types.LAYER_EDIT_INDICATOR_GROUP_SET:
            return {
                ...state,
                indicatorGroup: {
                    id: action.indicatorGroup.id,
                    name: action.indicatorGroup.name,
                },
                columns: [],
            }

        case types.LAYER_EDIT_DATA_ELEMENT_GROUP_SET:
            return {
                ...state,
                dataElementGroup: {
                    id: action.dataElementGroup.id,
                    name: action.dataElementGroup.name,
                },
                columns: [],
            }

        case types.LAYER_EDIT_OPERAND_SET:
            return {
                ...state,
                operand: action.operand,
                columns: [],
            }

        case types.LAYER_EDIT_DATA_ITEM_SET:
            return {
                ...state,
                columns: setDataItemInColumns(
                    action.dataItem,
                    action.dimension
                ),
                name: null,
            }

        case types.LAYER_EDIT_PERIOD_NAME_SET:
            return {
                ...state,
                periodName: action.periodName,
            }

        case types.LAYER_EDIT_PERIOD_TYPE_SET:
            return {
                ...state,
                periodType: action.periodType.id,
                filters: action.keepPeriod
                    ? state.filters
                    : removePeriodFromFilters(state.filters),
            }

        case types.LAYER_EDIT_PERIOD_SET:
            return {
                ...state,
                filters:
                    action.period.id !== START_END_DATES
                        ? setFiltersFromPeriod(state.filters, action.period)
                        : [],
            }

        case types.LAYER_EDIT_PERIODS_SET:
            return {
                ...state,
                filters: !(
                    action.periods.length === 1 &&
                    action.periods[0].id === START_END_DATES
                )
                    ? setFiltersFromPeriods(state.filters, action.periods)
                    : [],
            }

        case types.LAYER_EDIT_RENDERING_STRATEGY_SET:
            return {
                ...state,
                renderingStrategy: action.payload,
            }

        case types.LAYER_EDIT_START_DATE_SET:
            return {
                ...state,
                startDate: action.startDate,
            }

        case types.LAYER_EDIT_END_DATE_SET:
            return {
                ...state,
                endDate: action.endDate,
            }

        case types.LAYER_EDIT_AGGREGATION_TYPE_SET:
            // DEFAULT aggregation type is not stored
            if (action.aggregationType === 'DEFAULT') {
                const newState = { ...state }
                delete newState.aggregationType
                return newState
            }

            return {
                ...state,
                aggregationType: action.aggregationType,
            }

        case types.LAYER_EDIT_DIMENSION_FILTER_ADD:
            return {
                ...state,
                filters: [
                    ...(state.filters || []),
                    action.filter || {
                        dimension: null,
                    },
                ],
            }

        case types.LAYER_EDIT_DIMENSION_FILTER_REMOVE:
            return {
                ...state,
                filters: removeDimensionFromFilters(
                    state.filters,
                    action.index
                ),
            }

        case types.LAYER_EDIT_DIMENSION_FILTER_CHANGE:
            return {
                ...state,
                filters: changeDimensionInFilters(
                    state.filters,
                    action.index,
                    action.filter
                ),
            }

        case types.LAYER_EDIT_FILTER_ADD:
            return {
                ...state,
                columns: [
                    ...state.columns,
                    action.filter || {
                        dimension: null,
                        name: null,
                        filter: null,
                    },
                ],
            }

        case types.LAYER_EDIT_FILTER_REMOVE:
            columns = state.columns.filter((c) => c.filter !== undefined) // Also used for style data element without filter

            if (!columns || !columns[action.index]) {
                return state
            }

            return {
                ...state,
                columns: [
                    ...state.columns.filter((c) => c.filter === undefined),
                    ...columns.filter((c, i) => i !== action.index),
                ],
            }

        case types.LAYER_EDIT_FILTER_CHANGE:
            columns = state.columns.filter((c) => c.filter !== undefined) // Also used for style data element without filter

            if (!columns || !columns[action.index]) {
                return state
            }

            columns[action.index] = action.filter

            return {
                ...state,
                columns: [
                    ...state.columns.filter((c) => c.filter === undefined),
                    ...columns,
                ],
            }

        case types.LAYER_EDIT_STYLE_DATA_ITEM_SET:
            return {
                ...state,
                styleDataItem: action.dataItem,
            }

        // Set options to data element option set
        case types.LAYER_EDIT_STYLE_DATA_ITEM_OPTIONS_SET:
            newState = {
                ...state,
                styleDataItem: {
                    ...state.styleDataItem,
                    optionSet: {
                        ...state.styleDataItem.optionSet,
                        options: action.options,
                    },
                },
            }

            delete newState.method
            delete newState.classes
            delete newState.colorScale

            return newState

        case types.LAYER_EDIT_STYLE_DATA_ITEM_BOOLEAN_SET:
            newState = {
                ...state,
                styleDataItem: {
                    ...state.styleDataItem,
                    values: {
                        ...state.styleDataItem.values,
                        [action.value]: action.color,
                    },
                },
            }

            delete newState.method
            delete newState.classes
            delete newState.colorScale

            return newState

        case types.LAYER_EDIT_THEMATIC_MAP_TYPE_SET:
            newState = {
                ...state,
                thematicMapType: action.payload,
            }

            if (
                action.payload === THEMATIC_CHOROPLETH &&
                state.method === CLASSIFICATION_SINGLE_COLOR
            ) {
                delete newState.method
                delete newState.colorScale
                delete newState.classes
            }

            return newState

        case types.LAYER_EDIT_CLASSIFICATION_SET:
            newState = {
                ...state,
                method: action.method,
            }

            if (
                state.method === CLASSIFICATION_SINGLE_COLOR ||
                ![
                    CLASSIFICATION_EQUAL_INTERVALS,
                    CLASSIFICATION_EQUAL_COUNTS,
                ].includes(action.method)
            ) {
                delete newState.colorScale
                delete newState.classes
            }

            if (action.method !== CLASSIFICATION_PREDEFINED) {
                delete newState.legendSet
            }

            if (newState.styleDataItem) {
                delete newState.styleDataItem.optionSet
            }

            return newState

        case types.LAYER_EDIT_COLOR_SCALE_SET:
            newState = {
                ...state,
                colorScale: action.colorScale,
                classes: action.colorScale.length,
            }

            if (newState.styleDataItem) {
                delete newState.styleDataItem.optionSet
            }

            return newState

        case types.LAYER_EDIT_EVENT_STATUS_SET:
            newState = { ...state }

            // Default
            if (action.status === EVENT_STATUS_ALL) {
                delete newState.eventStatus
            } else {
                newState.eventStatus = action.status
            }

            return newState

        case types.LAYER_EDIT_EVENT_COORDINATE_FIELD_SET:
            return {
                ...state,
                eventCoordinateField: action.fieldId,
            }

        case types.LAYER_EDIT_FALLBACK_COORDINATE_FIELD_SET:
            newState = { ...state }

            if (action.fieldId === NONE) {
                delete newState.fallbackCoordinateField
            } else {
                newState.fallbackCoordinateField = action.fieldId
            }

            return newState

        case types.LAYER_EDIT_EVENT_CLUSTERING_SET:
            return {
                ...state,
                eventClustering: action.checked,
            }

        case types.LAYER_EDIT_EVENT_POINT_RADIUS_SET:
            return {
                ...state,
                eventPointRadius: parseInt(action.radius, 10),
            }

        case types.LAYER_EDIT_EVENT_POINT_COLOR_SET:
            return {
                ...state,
                eventPointColor: action.color,
            }

        case types.LAYER_EDIT_RELATED_POINT_COLOR_SET:
            return {
                ...state,
                relatedPointColor: action.color,
            }

        case types.LAYER_EDIT_RELATIONSHIP_LINE_COLOR_SET:
            return {
                ...state,
                relationshipLineColor: action.color,
            }

        case types.LAYER_EDIT_RELATED_POINT_RADIUS_SET:
            return {
                ...state,
                relatedPointRadius: parseInt(action.radius, 10),
            }

        case types.LAYER_EDIT_ORGANISATION_UNIT_COLOR_SET:
            return {
                ...state,
                organisationUnitColor: action.color,
            }

        case types.LAYER_EDIT_ORGANISATION_UNIT_GROUP_SET:
            return {
                ...state,
                organisationUnitGroupSet: action.organisationUnitGroupSet,
            }

        case types.LAYER_EDIT_ORGANISATION_UNITS_SET:
            return {
                ...state,
                rows: [action.payload],
            }

        case types.LAYER_EDIT_ORGANISATION_UNIT_FIELD_SET: {
            const { id, name } = action.payload

            return {
                ...state,
                orgUnitField: id,
                orgUnitFieldDisplayName: id !== NONE ? name : null,
                areaRadius: id === NONE ? EE_BUFFER : null,
            }
        }

        // Set organisation unit tree path (temporary solution, as favorites don't include paths)
        case types.LAYER_EDIT_ORGANISATION_UNIT_PATH_SET:
            return {
                ...state,
                rows: setOrgUnitPathInRows(state.rows, action.id, action.path),
            }

        case types.LAYER_EDIT_ORGANISATION_UNIT_MODE_SET:
            return {
                ...state,
                organisationUnitSelectionMode: action.payload,
            }

        case types.LAYER_EDIT_BAND_SET:
            return {
                ...state,
                band: action.payload,
            }

        case types.LAYER_EDIT_STYLE_SET:
            return {
                ...state,
                style: {
                    ...state.style,
                    ...action.payload,
                },
            }

        case types.LAYER_EDIT_FILTER_SET:
            return {
                ...state,
                filter: action.filter,
            }

        case types.LAYER_EDIT_LABELS_SET:
            return {
                ...state,
                labels: action.isChecked,
            }

        case types.LAYER_EDIT_LABEL_TEMPLATE:
            return {
                ...state,
                labelTemplate: action.template,
            }

        case types.LAYER_EDIT_LABEL_FONT_COLOR_SET:
            return {
                ...state,
                labelFontColor: action.color,
            }

        case types.LAYER_EDIT_LABEL_FONT_SIZE_SET:
            return {
                ...state,
                labelFontSize: action.size,
            }

        case types.LAYER_EDIT_LABEL_FONT_WEIGHT_SET:
            return {
                ...state,
                labelFontWeight: action.weight,
            }

        case types.LAYER_EDIT_LABEL_FONT_STYLE_SET:
            return {
                ...state,
                labelFontStyle: action.style,
            }

        case types.LAYER_EDIT_BUFFER_RADIUS_SET:
            return {
                ...state,
                areaRadius: action.radius,
            }

        case types.LAYER_EDIT_RADIUS_LOW_SET:
            return {
                ...state,
                radiusLow: parseInt(action.radius, 10),
            }

        case types.LAYER_EDIT_RADIUS_HIGH_SET:
            return {
                ...state,
                radiusHigh: parseInt(action.radius, 10),
            }

        case types.LAYER_EDIT_LEGEND_SET_SET:
            return {
                ...state,
                legendSet: action.legendSet,
            }

        case types.LAYER_EDIT_TRACKED_ENTITY_TYPE_SET:
            return {
                ...state,
                trackedEntityType: {
                    ...action.trackedEntityType,
                },
                program: null,
                programStage: null,
                relationshipType: null,
                relationshipOutsideProgram: null,
            }

        case types.LAYER_EDIT_TRACKED_ENTITY_RELATIONSHIP_TYPE_SET:
            return {
                ...state,
                relationshipType: action.relationshipType,
            }

        case types.LAYER_EDIT_TRACKED_ENTITY_RELATIONSHIP_OUTSIDE_PROGRAM_SET:
            return {
                ...state,
                relationshipOutsideProgram: action.payload,
            }

        case types.LAYER_EDIT_PROGRAM_STATUS_SET:
            newState = { ...state }

            // Default
            if (action.payload === 'ALL') {
                delete newState.programStatus
            } else {
                newState.programStatus = action.payload
            }

            return newState

        case types.LAYER_EDIT_FOLLOW_UP_SET:
            return {
                ...state,
                followUp: action.payload,
            }

        case types.LAYER_EDIT_NO_DATA_COLOR_SET:
            newState = { ...state }

            // Default is to show no feature
            if (!action.payload) {
                delete newState.noDataColor
            } else {
                newState.noDataColor = action.payload
            }

            return newState

        case types.LAYER_EDIT_EARTH_ENGINE_PERIOD_SET:
            return {
                ...state,
                period: action.payload,
            }

        case types.LAYER_EDIT_FEATURE_STYLE_SET:
            return {
                ...state,
                featureStyle: {
                    ...state.featureStyle,
                    ...action.payload,
                },
            }

        default:
            return state
    }
}

export default layerEdit
