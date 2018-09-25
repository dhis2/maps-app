import FileSaver from 'file-saver'; // https://github.com/eligrey/FileSaver.js
// import { createSld } from './sld';

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
}
export const downloadGeoJson = ({ name, data }) => {
    FileSaver.saveAs(createGeoJsonBlob(data), standardizeFilename(name) + '.geojson');
};

// export const downloadStyle = name => {
//     const sld = createSld(); // TODO: Make generic
//     const blob = new Blob([sld], { type: 'application/xml;charset=utf-8' });

//     FileSaver.saveAs(blob, standardizeFilename(name) + '.sld');
// };
