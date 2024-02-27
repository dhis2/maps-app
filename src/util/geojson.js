import findIndex from 'lodash/findIndex'
import { getPrecision, getRoundToPrecisionFn } from './numbers.js'

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
            type: geometry?.type,
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

export const buildEventGeometryGetter = (headers) => {
    const geomCol = findIndex(headers, (h) => h.name === 'geometry')
    return (event) => JSON.parse(event[geomCol])
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

// Returns bounds of coordinates array
export const getCoordinatesBounds = (coordinates) =>
    coordinates.reduce(
        (prev, coord) => [
            [Math.min(coord[0], prev[0][0]), Math.min(coord[1], prev[0][1])],
            [Math.max(coord[0], prev[1][0]), Math.max(coord[1], prev[1][1])],
        ],
        [
            [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
            [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
        ]
    )

const TYPE_NUMBER = 'number'
const TYPE_STRING = 'string'
// const TYPE_DATE = 'date'

export const getFeatureTypeAndRounding = (dataItem, allData) => {
    return Object.entries(dataItem)
        .filter(
            ([, value]) =>
                typeof value === TYPE_NUMBER || typeof value === TYPE_STRING
        )
        .map(([key, value]) => {
            let roundFn = null
            const type =
                typeof value === TYPE_NUMBER ? TYPE_NUMBER : TYPE_STRING

            if (type === TYPE_NUMBER) {
                const precision = getPrecision(allData.map((d) => d[key]))
                roundFn = getRoundToPrecisionFn(precision)
            }

            return {
                name: key,
                dataKey: key,
                type,
                roundFn,
                value: roundFn ? roundFn(value) : value,
            }
        })
}
