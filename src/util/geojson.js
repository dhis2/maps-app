import FileSaver from 'file-saver' // https://github.com/eligrey/FileSaver.js
import findIndex from 'lodash/findIndex'
import { poleOfInaccessibility } from '../components/map/MapApi.js'

export const META_DATA_FORMAT_ID = 'ID'
export const META_DATA_FORMAT_NAME = 'Name'
export const META_DATA_FORMAT_CODE = 'Code'

export const EVENT_ID_FIELD = 'psi'

const standardizeFilename = (rawName) => rawName.replace(/\s+/g, '_')
export const createGeoJsonBlob = (data) => {
    const geojson = {
        type: 'FeatureCollection',
        features: data,
    }

    const blob = new Blob([JSON.stringify(geojson)], {
        type: 'application/json;charset=utf-8',
    })
    return blob
}

export const downloadGeoJson = ({ name, data }) => {
    FileSaver.saveAs(
        createGeoJsonBlob(data),
        standardizeFilename(name) + '.geojson'
    )
}

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

// Translating polygons to points using poleOfInaccessibility from maps-gl
export const polygonsToPoints = (features) =>
    features.map((feature) => ({
        ...feature,
        geometry: {
            type: 'Point',
            coordinates: poleOfInaccessibility(feature.geometry),
        },
    }))

// export const downloadStyle = name => {
//     const sld = createSld(); // TODO: Make generic
//     const blob = new Blob([sld], { type: 'application/xml;charset=utf-8' });
//     FileSaver.saveAs(blob, standardizeFilename(name) + '.sld');
// };
