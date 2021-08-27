import i18n from '@dhis2/d2-i18n';
import { uniqBy } from 'lodash/fp';
import { getInstance as getD2 } from 'd2';
import { toGeoJson } from '../util/map';
import { getOrgUnitsFromRows } from '../util/analytics';
import { getDisplayProperty, getDisplayPropertyUrl } from '../util/helpers';

const colors = ['#111111', '#377eb8', '#a65628', '#984ea3', '#4daf4a'];
const weights = [2, 1, 0.75, 0.5];

// Returns a promise
const orgUnitLoader = async config => {
    const { rows, radiusLow } = config;
    const orgUnits = getOrgUnitsFromRows(rows);
    const orgUnitParams = orgUnits.map(item => item.id);

    const d2 = await getD2();
    const displayProperty = getDisplayProperty(d2).toUpperCase();
    const layerName = i18n.t('Boundaries');
    const orgUnitLevelNames = await getOrgUnitLevelNames(d2);

    const features = await d2.geoFeatures
        .byOrgUnit(orgUnitParams)
        .displayProperty(displayProperty)
        .getAll()
        .then(toGeoJson);

    const levels = uniqBy(f => f.properties.level, features)
        .map(f => f.properties.level)
        .sort();

    const levelStyle = levels.reduce(
        (obj, level, index) => ({
            ...obj,
            [level]: {
                color: colors[index] || '#333',
                weight: levels.length === 1 ? 1 : weights[index] || 0.5,
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
    });

    config.legend = {
        title: layerName,
        items: levels.map(level => ({
            name: orgUnitLevelNames[level],
            ...levelStyle[level],
        })),
    };

    return {
        ...config,
        data: features,
        name: layerName,
        alerts: !features.length
            ? [{ warning: true, message: i18n.t('No boundaries found') }]
            : undefined,
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    };
};

// This function returns the org unit level names used in the legend
// TODO: Refacotor when org unit level names are included in the metadata section
// of the analytics requests
const getOrgUnitLevelNames = async d2 => {
    const orgUnitLevels = await d2.models.organisationUnitLevels.list({
        fields: `id,${getDisplayPropertyUrl(d2)},level`,
        paging: false,
    });

    return orgUnitLevels
        ? orgUnitLevels.toArray().reduce(
              (obj, item) => ({
                  ...obj,
                  [item.level]: item.name,
              }),
              {}
          )
        : {};
};

export default orgUnitLoader;
