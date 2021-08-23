import i18n from '@dhis2/d2-i18n';
import { uniqBy } from 'lodash/fp';
import { getInstance as getD2 } from 'd2';
import { toGeoJson } from '../util/map';
import { getOrgUnitsFromRows } from '../util/analytics';
import { getDisplayProperty, getDisplayPropertyUrl } from '../util/helpers';

// This function returns the org unit level names used in the legend
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

const getFeatureStyle = (dimensions, groupSet) =>
    groupSet &&
    groupSet.organisationUnitGroups &&
    dimensions &&
    dimensions[groupSet.id]
        ? groupSet.organisationUnitGroups.find(
              g => g.id === dimensions[groupSet.id]
          )
        : {};

const styleFeatures = (
    features,
    groupSet,
    orgUnitLevelNames,
    { radiusLow }
) => {
    const levels = uniqBy(f => f.properties.level, features)
        .map(f => f.properties.level)
        .sort();

    const levelWeight = level =>
        Math.pow(levels.length - levels.indexOf(level), 1.2);

    const levelStyle = levels.reduce(
        (obj, level) => ({
            ...obj,
            [level]: {
                // color: colors[index] || '#333',
                color: '#333',
                weight: levelWeight(level),
            },
        }),
        {}
    );

    const styledFeatures = features.map(f => ({
        ...f,
        properties: {
            ...f.properties,
            // style: levelStyle[f.properties.level],
            labelStyle: {
                paddingTop:
                    f.geometry.type === 'Point'
                        ? 5 + (radiusLow || 5) + 'px'
                        : '0',
            },
            weight: levelWeight(f.properties.level),
            color: getFeatureStyle(f.properties.dimensions, groupSet).color,
        },
    }));

    const levelItems = levels.map(level => ({
        name: orgUnitLevelNames[level],
        ...levelStyle[level],
    }));

    const groupItems =
        groupSet && groupSet.organisationUnitGroups
            ? groupSet.organisationUnitGroups.map(({ name, color }) => ({
                  name,
                  color,
              }))
            : [];

    return {
        styledFeatures,
        legend: {
            items: [...levelItems, ...groupItems],
        },
    };
};

// Returns a promise
const orgUnitLoader = async config => {
    const { rows, organisationUnitGroupSet: groupSet } = config;
    const orgUnits = getOrgUnitsFromRows(rows);
    const orgUnitParams = orgUnits.map(item => item.id);
    const includeGroupSets = !!groupSet;

    const d2 = await getD2();
    const displayProperty = getDisplayProperty(d2).toUpperCase();

    const requests = [
        d2.geoFeatures
            .byOrgUnit(orgUnitParams)
            .displayProperty(displayProperty)
            .getAll({ includeGroupSets })
            .then(toGeoJson),
        getOrgUnitLevelNames(d2),
    ];

    const [features, orgUnitLevelNames] = await Promise.all(requests);

    const { styledFeatures, legend } = styleFeatures(
        features,
        groupSet,
        orgUnitLevelNames,
        config
    );

    const alerts = !features.length
        ? [{ warning: true, message: i18n.t('No org units found') }]
        : undefined;

    return {
        ...config,
        data: styledFeatures,
        name: i18n.t('Org units'),
        legend,
        alerts,
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    };
};

export default orgUnitLoader;
