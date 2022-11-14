import { getInstance as getD2 } from 'd2';
import { request } from '@esri/arcgis-rest-request';
import { queryFeatures } from '@esri/arcgis-rest-feature-service';
import { geojsonToArcGIS } from '@terraformer/arcgis';
import { getOrgUnitsFromRows } from '../util/analytics';
import { toGeoJson } from '../util/map';
import { getDisplayProperty } from '../util/helpers';

const featureServiceLoader = async layer => {
    const { rows, name, url, where } = layer;
    const legend = { title: name };
    const orgUnits = getOrgUnitsFromRows(rows);
    const orgUnitParams = orgUnits.map(item => item.id);
    const d2 = await getD2();
    const displayProperty = getDisplayProperty(d2).toUpperCase();
    const orgUnitsRequest = d2.geoFeatures
        .byOrgUnit(orgUnitParams)
        .displayProperty(displayProperty);
    let orgUnitFeatures;
    let feature;

    try {
        orgUnitFeatures = await orgUnitsRequest.getAll().then(toGeoJson);
    } catch (error) {
        // console.log(error); // TODO
    }

    if (orgUnitFeatures.length) {
        feature = orgUnitFeatures[0];
    }

    const metadata = await request(url);

    const { features /*, properties */ } = await queryFeatures({
        url,
        where,
        geometry: geojsonToArcGIS(feature.geometry),
        geometryType: 'esriGeometryPolygon',
        f: 'geojson',
        maxUrlLength: 2048,
        /* authentication, */
    });

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
