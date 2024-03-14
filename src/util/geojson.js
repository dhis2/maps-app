import findIndex from 'lodash/findIndex'

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

export const DHIS2_PROP = '__dhis2propertyid__'

export const getGeojsonDisplayData = (feature) => {
    const { properties } = feature
    if (!properties) {
        return []
    }
    return Object.entries(properties)
        .filter(
            ([, value]) =>
                typeof value === TYPE_NUMBER || typeof value === TYPE_STRING
        )
        .filter(([key, value]) =>
            // Remove id property if it was set internally
            key === 'id' &&
            typeof value === TYPE_STRING &&
            value.startsWith(DHIS2_PROP)
                ? false
                : true
        )
        .map(([key, value]) => {
            const type =
                typeof value === TYPE_NUMBER ? TYPE_NUMBER : TYPE_STRING

            return {
                name: key,
                dataKey: key,
                type,
                value,
            }
        })
}
export const GEO_TYPE_POINT = 'Point'
export const GEO_TYPE_POLYGON = 'Polygon'
export const GEO_TYPE_LINE = 'LineString'
const GEO_TYPE_FEATURE = 'Feature'
const GEO_TYPE_FEATURE_COLLECTION = 'FeatureCollection'

const rawGeometryTypes = [
    GEO_TYPE_POINT,
    GEO_TYPE_LINE,
    GEO_TYPE_POLYGON,
    'MultiPoint',
    'MultiLineString',
    'MultiPolygon',
]

// Ensure that we are always working with a FeatureCollection
export const buildGeoJsonFeatures = (geoJson) => {
    let finalGeoJson = geoJson

    if (geoJson.type === GEO_TYPE_FEATURE) {
        finalGeoJson = {
            type: GEO_TYPE_FEATURE_COLLECTION,
            features: [geoJson],
        }
    } else if (rawGeometryTypes.includes(geoJson.type)) {
        finalGeoJson = {
            type: GEO_TYPE_FEATURE_COLLECTION,
            features: [
                {
                    type: GEO_TYPE_FEATURE,
                    geometry: geoJson,
                    properties: {},
                },
            ],
        }
    } else if (geoJson.type === 'GeometryCollection') {
        const features = geoJson.geometries.map((geometry) => ({
            type: GEO_TYPE_FEATURE,
            geometry,
            properties: {},
        }))
        finalGeoJson = {
            type: GEO_TYPE_FEATURE_COLLECTION,
            features,
        }
    }

    const types = []
    const featureCollection = finalGeoJson.features.map((f, i) => {
        const nonMultiType = f.geometry.type.replace('Multi', '')
        // return list of types in the data (but not Multi* types,
        // because those should get lumped in with the non-Multi* type for the legend)
        if (!types.includes(nonMultiType)) {
            types.push(nonMultiType)
        }

        // Ensures that all features have a properties.id property
        // If properties.id is added, prefix it with DHIS2_PROP so that
        // it can be filtered out of the data table
        if (!f.properties.id) {
            f.properties.id = `${DHIS2_PROP}${i}`
        }

        return f
    })

    return { featureCollection, types }
}
