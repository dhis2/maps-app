import i18next from 'i18next';
import arrayUnique from 'd2-utilizr/lib/arrayUnique';
import { getInstance as getD2 } from 'd2/lib/d2';
import { toGeoJson } from '../util/map';
// import { getDisplayPropertyUrl } from '../util/helpers';
import { getOrgUnitsFromRows } from '../util/analytics';

const colors = ['black', 'blue', 'red', 'green', 'yellow'];
const weights = [2, 1, 0.75, 0.5, 0.5];

const boundaryLoader = async (config) => { // Returns a promise
    console.log('config', config);


    const { rows, radiusLow } = config;
    const orgUnits = getOrgUnitsFromRows(rows);
    const orgUnitParams = orgUnits.map(item => item.id);

    const d2 = await getD2();

    const propertyMap = {
        'name': 'name',
        'displayName': 'name',
        'shortName': 'shortName',
        'displayShortName': 'shortName'
    };

    const keyAnalysisDisplayProperty = gis.init.userAccount.settings.keyAnalysisDisplayProperty; // TODO
    const displayProperty = (propertyMap[keyAnalysisDisplayProperty] || 'name').toUpperCase();

    const data = await d2.geoFeatures
        .byOrgUnit(orgUnitParams)
        .displayProperty(displayProperty)
        .getAll();

    if (!data.length) {
        console.log('No data!');
        // gis.alert(GIS.i18n.no_valid_coordinates_found); // TODO
        return;
    }

    // console.log(data);

    const features = toGeoJson(data, 'ASC');

    // console.log(features);

    const levelStyle = {};
    let levels = [];

    for (let i = 0; i < data.length; i++) {
        levels.push(parseInt(data[i].le));
    }

    levels = arrayUnique(levels).sort();

    for (let i = 0; i < levels.length; i++) {
        levelStyle[levels[i]] = {
            color: colors[i],
            weight: (levels.length === 1 ? 1 : weights[i])
        };
    }

    features.forEach(feature => {
        feature.properties.style = levelStyle[feature.properties.level];
        feature.properties.labelStyle = {
            paddingTop: feature.geometry.type === 'Point' ? 5 + (radiusLow || 5) + 'px' : '0'
        };
    });

    /*
    labelFontSize: "11px"
    labelFontStyle: "normal"
    labels: false
    opacity: 1
    radiusLow: 4
    */

    return {
        ...config,
        data: features,
        title: i18next.t('Boundaries'),
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    };
};

export default boundaryLoader;


