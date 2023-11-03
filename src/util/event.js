import {
    EVENT_CLIENT_PAGE_SIZE,
    EVENT_COORDINATE_CASCADING,
    EVENT_COORDINATE_DEFAULT,
} from '../constants/layers.js'
import { getOrgUnitsFromRows, getPeriodFromFilters } from './analytics.js'
import { addStyleDataItem, createEventFeatures } from './geojson.js'

// Empty filter sometimes returned for saved maps
// Dimension without filter and empty items array returns false
const isValidDimension = ({ dimension, filter, items }) =>
    Boolean(dimension && (filter || !items || items.length))

const METADATA_FORMAT_NAME = 'name'

export const getEventColumns = async (
    layer,
    { format = METADATA_FORMAT_NAME, nameProperty, d2 }
) => {
    const result = await d2.models.programStage.get(layer.programStage.id, {
        fields: `programStageDataElements[displayInReports,dataElement[id,code,${nameProperty}~rename(name),optionSet]]`,
        paging: false,
    })

    return result.programStageDataElements
        .filter((el) => el.displayInReports)
        .map((el) => ({
            dimension: el.dataElement.id,
            name: el.dataElement[format],
        }))
}

// Also used to query for server cluster in map/EventLayer.js
// TODO: Use DataIDScheme / OutputIDScheme instead of requesting all metaData (which can easily dwarf the actual response data)
export const getAnalyticsRequest = async (
    {
        program,
        programStage,
        filters,
        startDate,
        endDate,
        rows,
        columns,
        styleDataItem,
        eventStatus,
        eventCoordinateField = EVENT_COORDINATE_DEFAULT,
        fallbackCoordinateField,
        relativePeriodDate,
        isExtended,
    },
    { d2, nameProperty }
) => {
    const orgUnits = getOrgUnitsFromRows(rows)
    const period = getPeriodFromFilters(filters)
    const dataItems = addStyleDataItem(
        columns.filter(isValidDimension),
        styleDataItem
    )

    // Add "display in reports" columns that are not already present
    if (isExtended) {
        const displayColumns = await getEventColumns(
            { programStage },
            { d2, nameProperty }
        )

        displayColumns.forEach((col) => {
            if (!dataItems.find((item) => item.dimension === col.dimension)) {
                dataItems.push(col)
            }
        })
    }

    let analyticsRequest = new d2.analytics.request()
        .withProgram(program.id)
        .withStage(programStage.id)
        .withCoordinatesOnly(true)

    analyticsRequest = period
        ? analyticsRequest.addPeriodFilter(period.id)
        : analyticsRequest.withStartDate(startDate).withEndDate(endDate)

    if (relativePeriodDate) {
        analyticsRequest =
            analyticsRequest.withRelativePeriodDate(relativePeriodDate)
    }

    analyticsRequest = analyticsRequest.addOrgUnitDimension(
        orgUnits.map((ou) => ou.id)
    )

    if (dataItems) {
        dataItems.forEach((item) => {
            analyticsRequest = analyticsRequest.addDimension(
                item.dimension,
                item.filter
            )
        })
    }

    analyticsRequest =
        analyticsRequest.withCoordinateField(eventCoordinateField)

    if (fallbackCoordinateField) {
        if (fallbackCoordinateField === EVENT_COORDINATE_CASCADING) {
            analyticsRequest = analyticsRequest.withParameters({
                defaultCoordinateFallback: true,
            })
        } else {
            analyticsRequest = analyticsRequest.withParameters({
                fallbackCoordinateField,
            })
        }
    }

    if (eventStatus && eventStatus !== 'ALL') {
        analyticsRequest = analyticsRequest.withEventStatus(eventStatus)
    }

    return analyticsRequest
}

export const loadData = async (request, config = {}, d2) => {
    const response = await d2.analytics.events.getQuery(
        request.withPageSize(EVENT_CLIENT_PAGE_SIZE)
    ) // DHIS2-10742

    const { data, names } = createEventFeatures(response, config)

    return {
        data,
        names,
        response,
    }
}
