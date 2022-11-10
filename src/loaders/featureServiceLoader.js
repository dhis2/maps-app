import { getInstance as getD2 } from 'd2';
import { getOrgUnitsFromRows } from '../util/analytics';
import { toGeoJson } from '../util/map';
import { getDisplayProperty } from '../util/helpers';
import { EXTERNAL_LAYER } from '../constants/layers';

const featureServiceLoader = async layer => {
    const { config, rows } = layer;
    const { name } = config;
    const legend = { title: name };
    const orgUnits = getOrgUnitsFromRows(rows);
    const orgUnitParams = orgUnits.map(item => item.id);
    const d2 = await getD2();
    const displayProperty = getDisplayProperty(d2).toUpperCase();
    const featuresRequest = d2.geoFeatures
        .byOrgUnit(orgUnitParams)
        .displayProperty(displayProperty);
    let features;
    let geometry;

    try {
        features = await featuresRequest.getAll().then(toGeoJson);
    } catch (error) {
        // console.log(error); // TODO
    }

    if (features.length) {
        geometry = features[0].geometry;
    }

    // console.log('geometry', geometry);

    return {
        ...layer,
        layer: EXTERNAL_LAYER,
        name,
        legend,
        config: {
            ...config,
            geometry,
        },
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    };
};

export default featureServiceLoader;
