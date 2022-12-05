import { getInstance as getD2 } from 'd2';
import { request } from '@esri/arcgis-rest-request';
import { queryFeatures } from '@esri/arcgis-rest-feature-service';
import { geojsonToArcGIS } from '@terraformer/arcgis';
import { getOrgUnitsFromRows } from '../util/analytics';
import { toGeoJson } from '../util/map';
import { getDisplayProperty } from '../util/helpers';

const featureServiceLoader = async layer => {
    const { rows, name, url, where, featureStyle } = layer;
    const legend = { title: name, items: [] };

    const d2 = await getD2();
    const displayProperty = getDisplayProperty(d2).toUpperCase();

    let orgUnitFeatures;
    let feature;

    console.log('rows', rows);

    if (rows && rows.length) {
        const orgUnits = getOrgUnitsFromRows(rows);
        const orgUnitParams = orgUnits.map(item => item.id);

        const orgUnitsRequest = d2.geoFeatures
            .byOrgUnit(orgUnitParams)
            .displayProperty(displayProperty);

        try {
            orgUnitFeatures = await orgUnitsRequest.getAll().then(toGeoJson);
        } catch (error) {
            // console.log(error); // TODO
        }

        if (orgUnitFeatures.length) {
            feature = orgUnitFeatures[0];
        }
    }

    const metadata = await request(url);

    const { features /*, properties */ } = await queryFeatures({
        url,
        where,
        geometry: feature ? geojsonToArcGIS(feature.geometry) : null,
        geometryType: 'esriGeometryPolygon',
        f: 'geojson',
        maxUrlLength: 2048,
        resultOffset: 0, // TODO: Remove
        resultRecordCount: 100, // TODO: Remove
        /* authentication, */
    });

    legend.items.push({
        name: 'Feature',
        ...featureStyle,
        fillColor: featureStyle.color, // TODO: Clean up styles
    });

    console.log('features', features);
    // https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/USGS_Seismic_Data_v1/FeatureServer/0/query?f=pbf&cacheHint=true&maxRecordCountFactor=4&resultOffset=0&resultRecordCount=8000&where=1%3D1&orderByFields=OBJECTID&outFields=OBJECTID%2Calert%2Cmag&outSR=102100&spatialRel=esriSpatialRelIntersects

    return {
        ...layer,
        name,
        legend,
        data: features,
        fields: metadata.fields,
        feature,
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    };
};

export default featureServiceLoader;
