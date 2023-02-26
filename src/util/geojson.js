import findIndex from 'lodash/findIndex'
import { isValidCoordinate } from './map.js'

export const EVENT_ID_FIELD = 'psi'

// TODO: Remove name mapping logic, use server params DataIDScheme / OuputIDScheme instead
/* eslint-disable max-params */
export const createEventFeature = (
    headers,
    names,
    options,
    event,
    id,
    getGeometry
) => {
    const geometry = getGeometry(event)
    const properties = event.reduce((props, value, i) => {
        const header = headers[i]
        let option

        if (header.optionSet) {
            option = options.find((option) => option.code === value)
        }

        return {
            id,
            type: geometry.type,
            ...props,
            [names[header.name] || header.name]: option ? option.name : value,
        }
    }, {})

    return {
        type: 'Feature',
        id,
        properties,
        geometry,
    }
}
/* eslint-enable max-params */

export const buildEventGeometryGetter = (headers, eventCoordinateField) => {
    // If coordinate field other than event location (only points are currently supported)
    if (eventCoordinateField) {
        const col = findIndex(headers, (h) => h.name === eventCoordinateField)

        return (event) => {
            let coordinates = event[col]

            if (typeof coordinates === 'string' && coordinates.length) {
                try {
                    coordinates = JSON.parse(coordinates)
                } catch (evt) {
                    return null
                }
            }

            if (Array.isArray(coordinates) && isValidCoordinate(coordinates)) {
                return {
                    type: 'Point',
                    coordinates,
                }
            }

            return null
        }
    } else {
        // Use event location (can be point or polygon)
        const geomCol = findIndex(headers, (h) => h.name === 'geometry')
        return (event) => JSON.parse(event[geomCol])
    }
}

export const createEventFeatures = (response, config = {}) => {
    const names = {
        ...response.headers.reduce(
            (names, header) => ({
                ...names,
                [header.name]: header.column,
            }),
            {}
        ),
        ...config.columnNames, // TODO: Check if columnNames is still needed
    }

    const idColName = config.idCol || EVENT_ID_FIELD
    const idCol = findIndex(response.headers, (h) => h.name === idColName)
    const getGeometry = buildEventGeometryGetter(
        response.headers,
        config && config.eventCoordinateField
    )
    const options = Object.values(response.metaData.items)

    const data = response.rows.map((row) =>
        createEventFeature(
            response.headers,
            config.outputIdScheme !== 'ID' ? names : {},
            options,
            row,
            row[idCol],
            getGeometry
        )
    )

    // Sort to draw polygons before points
    data.sort((feature) => (feature.geometry.type === 'Polygon' ? -1 : 0))

    return { data, names }
}

// Include column for data element used for styling (if not already used in filter)
export const addStyleDataItem = (dataItems, styleDataItem) =>
    styleDataItem &&
    !dataItems.find((item) => item.dimension === styleDataItem.id)
        ? [
              ...dataItems,
              {
                  dimension: styleDataItem.id,
                  name: styleDataItem.name,
              },
          ]
        : [...dataItems]

export const getBounds = (bbox) => {
    if (!bbox) {
        return null
    }
    const extent = bbox.match(/([-\d.]+)/g)
    return [
        [extent[0], extent[1]],
        [extent[2], extent[3]],
    ]
}
