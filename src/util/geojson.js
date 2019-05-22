import FileSaver from 'file-saver'; // https://github.com/eligrey/FileSaver.js
import findIndex from 'lodash/findIndex';
import { isValidCoordinate } from './map';
// import { createSld } from './sld';

export const META_DATA_FORMAT_ID = 'ID';
export const META_DATA_FORMAT_NAME = 'Name';
export const META_DATA_FORMAT_CODE = 'Code';

const standardizeFilename = rawName => rawName.replace(/\s+/g, '_');
export const createGeoJsonBlob = data => {
    const geojson = {
        type: 'FeatureCollection',
        features: data,
    };

    const blob = new Blob([JSON.stringify(geojson)], {
        type: 'application/json;charset=utf-8',
    });
    return blob;
};

export const downloadGeoJson = ({ name, data }) => {
    FileSaver.saveAs(
        createGeoJsonBlob(data),
        standardizeFilename(name) + '.geojson'
    );
};

// TODO: Remove name mapping logic, use server params DataIDScheme / OuputIDScheme instead
// TODO: Validate this logic - value might sometimes need to be mapped with names
export const createEventFeature = (headers, names, event, id, getGeometry) => {
    const properties = event.reduce(
        (props, value, i) => ({
            ...props,
            [names[headers[i].name] || headers[i].name]: value, // TODO: Regression - values no longer translated
        }),
        {}
    );

    return {
        type: 'Feature',
        id,
        properties,
        geometry: getGeometry(event),
    };
};

export const buildEventGeometryGetter = (headers, eventCoordinateField) => {
    // If coordinate field other than event location (only points are currently supported)
    if (eventCoordinateField) {
        const col = findIndex(headers, h => h.name === eventCoordinateField);

        return event => {
            let coordinates = event[col];

            if (typeof coordinates === 'string' && coordinates.length) {
                try {
                    coordinates = JSON.parse(coordinates);
                } catch (evt) {
                    return null;
                }
            }

            if (Array.isArray(coordinates) && isValidCoordinate(coordinates)) {
                return {
                    type: 'Point',
                    coordinates,
                };
            }

            return null;
        };
    } else {
        // Use event location (can be point or polygon)
        const geomCol = findIndex(headers, h => h.name === 'geometry');
        return event => JSON.parse(event[geomCol]);
    }
};

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
    };

    const idColName = config.idCol || 'psi';
    const idCol = findIndex(response.headers, h => h.name === idColName);
    const getGeometry = buildEventGeometryGetter(
        response.headers,
        config && config.eventCoordinateField
    );

    const data = response.rows.map(row =>
        createEventFeature(
            response.headers,
            config.outputIdScheme !== 'ID' ? names : {},
            row,
            row[idCol],
            getGeometry
        )
    );

    // Sort to draw polygons before points
    data.sort(feature => (feature.geometry.type === 'Polygon' ? -1 : 0));

    return { data, names };
};

// Include column for data element used for styling (if not already used in filter)
export const addStyleDataItem = (dataItems, styleDataItem) =>
    styleDataItem &&
    !dataItems.find(item => item.dimension === styleDataItem.id)
        ? [
              ...dataItems,
              {
                  dimension: styleDataItem.id,
                  name: styleDataItem.name,
              },
          ]
        : [...dataItems];

export const getBounds = bbox => {
    if (!bbox) {
        return null;
    }
    const extent = bbox.match(/([-\d.]+)/g);
    return [[extent[1], extent[0]], [extent[3], extent[2]]];
};

// export const downloadStyle = name => {
//     const sld = createSld(); // TODO: Make generic
//     const blob = new Blob([sld], { type: 'application/xml;charset=utf-8' });
//     FileSaver.saveAs(blob, standardizeFilename(name) + '.sld');
// };
