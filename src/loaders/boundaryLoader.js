import i18n from '@dhis2/d2-i18n';
import { uniqBy } from 'lodash/fp';
import { getInstance as getD2 } from 'd2';
import { toGeoJson } from '../util/map';
import { getOrgUnitsFromRows } from '../util/analytics';
import { getDisplayProperty } from '../util/helpers';

const colors = ['black', 'blue', 'red', 'green', 'yellow'];
const weights = [2, 1, 0.75, 0.5, 0.5];

const boundaryLoader = async config => {
    // Returns a promise
    const { rows, radiusLow } = config;
    const orgUnits = getOrgUnitsFromRows(rows);
    const orgUnitParams = orgUnits.map(item => item.id);

    const d2 = await getD2();
    const displayProperty = getDisplayProperty(d2).toUpperCase();

    const features = await d2.geoFeatures
        .byOrgUnit(orgUnitParams)
        .displayProperty(displayProperty)
        .getAll()
        .then(toGeoJson);

    if (!features.length) {
        // gis.alert(GIS.i18n.no_valid_coordinates_found); // TODO
        return;
    }

    const levels = uniqBy(f => f.properties.level, features)
        .map(f => f.properties.level)
        .sort();

    const levelStyle = levels.reduce(
        (obj, level, index) => ({
            ...obj,
            [level]: {
                color: colors[index],
                weight: levels.length === 1 ? 1 : weights[index],
            },
        }),
        {}
    );

    features.forEach(feature => {
        feature.properties.style = levelStyle[feature.properties.level];
        feature.properties.labelStyle = {
            paddingTop:
                feature.geometry.type === 'Point'
                    ? 5 + (radiusLow || 5) + 'px'
                    : '0',
        };
        feature.properties.type = feature.geometry.type;
    });

    return {
        ...config,
        data: features,
        name: i18n.t('Boundaries'),
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    };
};

export default boundaryLoader;
